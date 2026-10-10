import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { ContactForm } from './ContactForm'

const field = (name: RegExp) => screen.getByRole('textbox', { name })
const sendButton = () => screen.getByRole('button', { name: /Send Message/ })

describe('ContactForm', () => {
  it('renders the heading and contact information', () => {
    render(<ContactForm />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Get in Touch')
    expect(screen.getByText('Contact Information')).toBeInTheDocument()
    expect(screen.getByText('hello@nativecave.com')).toBeInTheDocument()
  })

  it('starts with the send button disabled and no errors', () => {
    render(<ContactForm />)
    expect(sendButton()).toBeDisabled()
    expect(screen.queryByText(/cannot be empty/)).not.toBeInTheDocument()
  })

  describe('name', () => {
    it('shows an error when cleared', async () => {
      render(<ContactForm />)
      await userEvent.type(field(/^Name/), 'A')
      await userEvent.clear(field(/^Name/))
      expect(screen.getByText('Name cannot be empty and max 40 characters')).toBeInTheDocument()
      expect(field(/^Name/)).toHaveAttribute('aria-invalid', 'true')
    })

    it('shows an error past 40 characters and clears it when valid again', async () => {
      render(<ContactForm />)
      await userEvent.type(field(/^Name/), 'a'.repeat(41))
      expect(screen.getByText('Name cannot be empty and max 40 characters')).toBeInTheDocument()
      await userEvent.type(field(/^Name/), '{Backspace}')
      expect(screen.queryByText('Name cannot be empty and max 40 characters')).not.toBeInTheDocument()
    })

    it('treats whitespace only as empty', async () => {
      render(<ContactForm />)
      await userEvent.type(field(/^Name/), '   ')
      expect(screen.getByText('Name cannot be empty and max 40 characters')).toBeInTheDocument()
    })
  })

  describe('email', () => {
    it('shows an error for an invalid format', async () => {
      render(<ContactForm />)
      await userEvent.type(field(/^Email/), 'not-an-email')
      expect(screen.getByText('Email format is invalid')).toBeInTheDocument()
      expect(sendButton()).toBeDisabled()
    })

    it('rejects a single-letter top level domain', async () => {
      render(<ContactForm />)
      await userEvent.type(field(/^Email/), 'ada@example.c')
      expect(screen.getByText('Email format is invalid')).toBeInTheDocument()
    })

    // type="email" inputs strip leading/trailing whitespace themselves, so test an inner space
    it('rejects whitespace inside the address', async () => {
      render(<ContactForm />)
      await userEvent.type(field(/^Email/), 'ada @example.com')
      expect(screen.getByText('Email format is invalid')).toBeInTheDocument()
    })

    it('accepts a valid email', async () => {
      render(<ContactForm />)
      await userEvent.type(field(/^Email/), 'ada@example.com')
      expect(screen.queryByText('Email format is invalid')).not.toBeInTheDocument()
    })
  })

  it('shows a subject error past 40 characters', async () => {
    render(<ContactForm />)
    await userEvent.type(field(/^Subject/), 'b'.repeat(41))
    expect(screen.getByText('Subject cannot be empty and max 40 characters')).toBeInTheDocument()
  })

  it('shows a message error past 100 characters', async () => {
    render(<ContactForm />)
    const message = field(/^Message/)
    await userEvent.click(message)
    await userEvent.paste('m'.repeat(101))
    expect(screen.getByText('Message cannot be empty and max 100 characters')).toBeInTheDocument()
  })

  describe('send button', () => {
    const fillValid = async () => {
      await userEvent.type(field(/^Name/), 'Ada')
      await userEvent.type(field(/^Email/), 'ada@example.com')
      await userEvent.type(field(/^Subject/), 'Birthday')
      await userEvent.type(field(/^Message/), 'Table for six please')
    }

    it('is enabled once every field is valid', async () => {
      render(<ContactForm />)
      await fillValid()
      expect(sendButton()).toBeEnabled()
    })

    it('stays disabled with a valid email while other fields are empty', async () => {
      render(<ContactForm />)
      await userEvent.type(field(/^Email/), 'ada@example.com')
      expect(sendButton()).toBeDisabled()
    })

    it('is disabled again when a field becomes invalid', async () => {
      render(<ContactForm />)
      await fillValid()
      await userEvent.type(field(/^Name/), 'a'.repeat(40))
      expect(sendButton()).toBeDisabled()
    })

    it('is disabled again when the email becomes invalid', async () => {
      render(<ContactForm />)
      await fillValid()
      await userEvent.type(field(/^Email/), ' x')
      expect(sendButton()).toBeDisabled()
    })
  })
})
