
import * as React from 'react';
import { Container, Typography, TextField, Button, Box, Grid, Paper } from '@mui/material';
import { MailOutline, PhoneOutlined, LocationOnOutlined, Send } from '@mui/icons-material';

interface ContactPageForm {
  name: string,
  email: string,
  subject: string,
  messageField:string,
  nameErrorMessage?: string,
  isNameError?:boolean,
  emailErrorMessage?: string,
  isEmailError?:boolean,
  subjectErrorMessage?: string,
  isSubjectError?:boolean,
  messageErrorMessage?: string,
  isMessageError?:boolean,
  isValid: boolean
}

const ContactForm = () => {
  //^[a-zA-Z0–9._%+-]+@[a-zA-Z0–9.-]+\.[a-zA-Z]{2,}$ --> regex for email
  const [formModel, setFormModel] = React.useState<ContactPageForm>({
    name: '',
    email: '',
    subject: '',
    messageField: '',
    nameErrorMessage: '',
    isNameError: false,
    emailErrorMessage:'',
    isEmailError:false,
    subjectErrorMessage: '',
    isSubjectError:false,
    messageErrorMessage: '',
    isMessageError:false,
    isValid: false,
  });
  
  /**
   * name change field
  * */
  const handleNameChange = (e:React.ChangeEvent<HTMLInputElement>) => {
    if(!e.target) return;
    const { value } = e.target;
    if(value.trim().length > 0 && value.length <= 40){
      setFormModel(prevState => ({
        ...prevState,
        name:value,
        nameErrorMessage:'',
        isNameError:false
      }))
    }else{
      setFormModel(prevState => ({
        ...prevState,
        name: value,
        nameErrorMessage:'Name cannot be empty and max 40 characters',
        isNameError:true,
      }))
    }
  }
  /**
   * email change field
   * */
  const handleEmailChange = (e:React.ChangeEvent<HTMLInputElement>) => {
    if(!e.target) return;
    const { value } = e.target;
    const emailPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const noWhitespacePattern:RegExp = /^\S+$/;
    if(emailPattern.test(value.trim()) && noWhitespacePattern.test(value)) {
      setFormModel(prev=>({
        ...prev,
        email:value,
        isEmailError: false,
        emailErrorMessage: '',
        isValid: true,
      }));
    } else {
      setFormModel(prevState =>({
        ...prevState,
        email:value,
        isEmailError: true,
        emailErrorMessage: 'Email format is invalid',
        isValid: false
      }));
    }
  }
  /*
   * subject change field
   * */
  const handleSubjectChange = (e:React.ChangeEvent<HTMLInputElement>) => {
    if(!e.target) return;
    const { value } = e.target;
    if(value.trim().length > 0 && value.length <= 40){
      setFormModel(prevState => ({
        ...prevState,
        subject:value,
        subjectErrorMessage:'',
        isSubjectError:false
      }))
    }else{
      setFormModel(prevState => ({
        ...prevState,
        subject: value,
        subjectErrorMessage:'Subject cannot be empty and max 40 characters',
        isSubjectError:true,
      }))
    }
  }
  /**
   * message field change function
   * */
  const handleMessageChange = (e:React.ChangeEvent<HTMLInputElement>) => {
    if(!e.target) return;
    const { value } = e.target;
    if(value.trim().length > 0 && value.length <= 100){
      setFormModel(prevState => ({
        ...prevState,
        messageField:value,
        messageErrorMessage:'',
        isMessageError:false
      }))
    }else{
      setFormModel(prevState => ({
        ...prevState,
        messageField: value,
        messageErrorMessage:'Message cannot be empty and max 100 characters',
        isMessageError:true,
      }))
    }
  }
  
  return (
    <section className="py-20 bg-gray-50">
      <Container maxWidth="lg">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Get in <span className="text-amber-500">Touch</span>
          </h2>
          <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Have questions or want to make a special request? We'd love to hear from you.
          </p>
          <div className="w-20 h-1.5 bg-amber-500 mx-auto mt-8 rounded-full" />
        </div>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper elevation={0} className="p-8 rounded-3xl border border-gray-100 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.05)] h-full">
              <h3 className="text-2xl font-bold text-gray-900 mb-8">Contact Information</h3>
              <div className="space-y-6">
                {[
                  { icon: <LocationOnOutlined className="text-amber-500" />, title: "Address", text: "123 Coastal Way, Seaside, CA 90210" },
                  { icon: <PhoneOutlined className="text-amber-500" />, title: "Phone", text: "(555) 123-4567" },
                  { icon: <MailOutline className="text-amber-500" />, title: "Email", text: "hello@nativecave.com" }
                ].map((item, i) => (
                  <Box key={i} className="flex items-start gap-4">
                    <Box className="p-3 bg-amber-50 rounded-xl">{item.icon}</Box>
                    <div>
                      <Typography variant="subtitle2" className="text-gray-500 font-semibold uppercase tracking-wider text-xs">{item.title}</Typography>
                      <Typography variant="body1" className="text-gray-900 font-medium">{item.text}</Typography>
                    </div>
                  </Box>
                ))}
              </div>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 7 }}>
            <Paper elevation={0} className="p-8 md:p-12 rounded-3xl border border-gray-100 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
              <form className="space-y-6">
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField fullWidth label="Name" variant="outlined" className="bg-gray-50" sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        borderRadius: '12px',
                        '&:hover fieldset': { borderColor: '#f59e0b' },
                        '&.Mui-focused fieldset': { borderColor: '#f59e0b' }
                      },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#f59e0b' }
                    }}
                    value={formModel.name}
                    onChange={handleNameChange}
                    required={true}
                    error={formModel.isNameError}
                    helperText={formModel.nameErrorMessage}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField fullWidth label="Email" variant="outlined" className="bg-gray-50 border-amber-500" sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        borderRadius: '12px',
                        '&:hover fieldset': { borderColor: '#f59e0b' },
                        '&.Mui-focused fieldset': { borderColor: '#f59e0b' }
                      },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#f59e0b' }
                    }}
                     type="email"
                     required={true}
                               value={formModel.email}
                               onChange={handleEmailChange}
                     placeholder={'mail@mail.com'}
                     error={formModel.isEmailError}
                     helperText={formModel.emailErrorMessage}
                    />
                  </Grid>
                  <Grid size={12}>
                    <TextField fullWidth label="Subject" variant="outlined" className="bg-gray-50" sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        borderRadius: '12px',
                        '&:hover fieldset': { borderColor: '#f59e0b' },
                        '&.Mui-focused fieldset': { borderColor: '#f59e0b' }
                      },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#f59e0b' }
                    }}
                               type={'text'}
                               value={formModel.subject}
                               required={true}
                               onChange={handleSubjectChange}
                               error={formModel.isSubjectError}
                               helperText={formModel.subjectErrorMessage}/>
                  </Grid>
                  <Grid size={12}>
                    <TextField fullWidth label="Message" multiline rows={4} variant="outlined" className="bg-gray-50" sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        borderRadius: '12px',
                        '&:hover fieldset': { borderColor: '#f59e0b' },
                        '&.Mui-focused fieldset': { borderColor: '#f59e0b' }
                      },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#f59e0b' }
                    }}
                    type={'text'}
                    value={formModel.messageField}
                    required={true}
                    onChange={handleMessageChange}
                    error={formModel.isMessageError}
                    helperText={formModel.messageErrorMessage}
                    />
                  </Grid>
                </Grid>
                <Button 
                  fullWidth 
                  variant="contained" 
                  size="large"
                  //TODO:{/* to complete validation for button to enable */}
                  disabled={!formModel.isValid}
                  endIcon={<Send />}
                  sx={{
                    backgroundColor: '#f59e0b',
                    py: 2,
                    borderRadius: '12px',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': { backgroundColor: '#d97706' }
                  }}
                >
                  Send Message
                </Button>
              </form>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </section>
  );
};
export { ContactForm };