import React, { createContext, PropsWithChildren, useContext, useEffect } from 'react'

export interface ModalContext {
  isActive: boolean
  handleClose: () => void
}

export type ModalProps = ModalContext & PropsWithChildren

const MODAL_CONTEXT = createContext<ModalContext>({
  isActive: false,
  handleClose: () => {}
})

export function useModal (): ModalContext {
  return useContext(MODAL_CONTEXT)
}

export default function Modal ({ isActive, handleClose, children }: ModalProps) {
  useEffect(() => {
    if (!isActive) return
    function handleEscapeKey (e: KeyboardEvent) {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', handleEscapeKey)
    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [isActive, handleClose])

  return (
    <MODAL_CONTEXT.Provider value={{ isActive, handleClose }}>
      <div className={`modal ${isActive ? 'is-active' : ''}`}>
          <div className='modal-background' onClick={handleClose}></div>
          <div className='modal-card'>
              <div className='modal-card-body p-6'>
                  {children}
              </div>
          </div>
          <button className='modal-close is-large' aria-label='Close' onClick={handleClose}></button>
      </div>
    </MODAL_CONTEXT.Provider>
  )
}
