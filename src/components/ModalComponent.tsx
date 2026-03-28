
/**
 * Modal Component
 * */
import * as React from 'react';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import Typography from '@mui/material/Typography';
import {Chip} from "@mui/material";
import CurrencyPoundIcon from '@mui/icons-material/CurrencyPound';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 350,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

interface ModalProps {
  open: boolean;
  onClose: () => void;
}
const ModalComponent: React.FC<ModalProps> = ({ open, onClose }) => {
  return (
    <div>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open}
        onClose={onClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={open}>
          <Box sx={style}>
            <Typography id="transition-modal-title" variant="h6" component="h2">
              Text in a modal
            </Typography>
            <Typography id="transition-modal-description" sx={{ mt: 2 }}>
              <ol className={'list-decimal'}>
                <li>
                  Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
                  <div className={'mt-0.5'}>
                    <Chip icon={<CurrencyPoundIcon fontSize={'small'} className={'-mr-3 text-black'}/>} label="5" variant="outlined" className={'bg-green-400 text-lg'}/>
                  </div>
                </li>
                <li>
                  Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
                </li>
              </ol>
            </Typography>
          </Box>
        </Fade>
      </Modal>
    </div>
  );
}
export {ModalComponent}