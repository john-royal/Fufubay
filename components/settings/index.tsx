import Modal from '../common/modal'
import SettingsItem from './item'
import AddressModal from './address'
import EmailModal from './email'
import PasswordModal from './password'
import PaymentModal from './payment'
import ProfileModal from './profile'
import PhoneModal from './phone'

export { SettingsItem }

export interface SettingsItemState {
  item: SettingsItem | null
  setItem: (item: SettingsItem | null) => void
}

function ModalBody ({ item }: { item: SettingsItem | null }) {
  switch (item) {
    case SettingsItem.PROFILE:
      return <ProfileModal />
    case SettingsItem.PASSWORD:
      return <PasswordModal />
    case SettingsItem.EMAIL_ADDRESS:
      return <EmailModal />
    case SettingsItem.PHONE_NUMBER:
      return <PhoneModal />
    case SettingsItem.CREDIT_CARD:
      return <PaymentModal />
    case SettingsItem.ADDRESS:
      return <AddressModal />
    case SettingsItem.PAYOUT_ACCOUNT:
      return <progress className="progress" max="100">15%</progress>
    case null:
      return <></>
  }
}

export default function SettingsModal ({ item, setItem }: SettingsItemState) {
  return (
    <Modal isActive={item != null} handleClose={() => setItem(null)}>
      <ModalBody item={item} />
    </Modal>
  )
}
