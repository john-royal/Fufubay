import Star from "./star";

const Report = ({isVisible, onClose}) => {
    if (!isVisible) return null;
    return (
        <div className="modal is-active">
             <div className="modal-background">
                <button className="button is-dark" onClick={() => onClose()}>X</button>
                <div className="modal-content has-background-white py-5 px-5">
                    <h3 className="title mb-6">Rate User</h3>
                    <Star />
                </div>
            </div>

        </div>
    );
}

export default Report;