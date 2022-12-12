import { Button, Form, TextField } from "components/common/form";
import { FormEvent } from "react";

const Report = ({ isVisible, onClose }) => {
    if (!isVisible) return null;
    return (
        <div className="modal is-active">
             <div className="modal-background">
                <button className="button is-dark" onClick={() => onClose()}>X</button>
                <div className="modal-content has-background-white py-5 px-5">
                    <h3 className="title mb-6">Report Seller</h3>
                    <Form onSubmit={function (event: FormEvent<HTMLFormElement>): void | Promise<void> {
                        throw new Error("Function not implemented.");
                    } }>
        <TextField title='Comments' type='text' name='Issues' />
        <Button title='Submit' />
        <Button title='Report a Crime' />
      </Form>
                </div>
            </div>

        </div>
    );
}

export default Report;