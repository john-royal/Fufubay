import React, { useEffect } from 'react'

export interface ModalProps extends React.PropsWithChildren {
  isActive: boolean
  handleClose: () => void
}

export default function Modal ({ isActive, handleClose, children }: ModalProps) {
  function handleEscapeKey (e: KeyboardEvent) {
    if (e.key === 'Escape') handleClose()
  }
  useEffect(() => {
    if (isActive) {
      document.addEventListener('keydown', handleEscapeKey)
    } else {
      document.removeEventListener('keydown', handleEscapeKey)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive])
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
