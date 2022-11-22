import React from 'react'

export interface ModalProps extends React.PropsWithChildren {
  isActive: boolean
  handleClose: () => void
}

export default function Modal ({ isActive, handleClose, children }: ModalProps) {
  return (
    <div className={`modal ${isActive ? 'is-active' : ''}`}>
        <div className='modal-background' onClick={handleClose}></div>
        <div className='modal-card'>
            <div className='modal-card-body p-6'>
                {children}
            </div>
        </div>
        <button className='modal-close is-large' aria-label='Close' onClick={handleClose}></button>
    </div>
  )
}
