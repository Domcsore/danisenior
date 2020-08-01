import 'core-js';
import 'whatwg-fetch';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

type ContactFormProps = {
    apiEndpoint: string
}

interface ContactData {
    name: string;
    email: string;
    message: string;
    ref: string;
}

enum FormState {
    Waiting,
    Sent,
    Success,
    Fail
}

const ContactForm:React.FunctionComponent<ContactFormProps> = (props: ContactFormProps) => {
    const [name, setName] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [message, setMessage] = React.useState("");
    const [formState, setFormState] = React.useState(FormState.Waiting);
    const [responseMessage, setResponseMessage] = React.useState("");

    function HandleTextAreaChange(e: React.FormEvent<HTMLTextAreaElement>) {
        const target = e.target as HTMLTextAreaElement;
        setMessage(target.value);
    }

    function HandleInputChange(e: React.FormEvent<HTMLInputElement>) {
        const target = e.target as HTMLTextAreaElement;
        switch(target.name) {
            case "name":
                setName(target.value);
                break;
            case "email":
                setEmail(target.value);
                break;
        }
    }

    function HandleSubmit(e: React.FormEvent) {
        e.preventDefault();

        setFormState(FormState.Sent);

        const params = (new URL(location.href)).searchParams;
        let ref = params.get("ref") ? params.get("ref") : "home";

        let contactData: ContactData = {
            name: name,
            email: email,
            message: message,
            ref: ref
        };

        fetch(props.apiEndpoint, {
            method: "POST",
            mode: "cors",
            cache: "no-cache",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(contactData)
        }).then(response => {
            if (response.status !== 200) {
                setFormState(FormState.Fail);
                setResponseMessage("Something went wrong, please try again in a moment.");
                response.json().then(e => console.log(e));
            } else {
                setFormState(FormState.Success);
                setResponseMessage("Your message was sent, thank you for getting in touch.");
            }
        }).catch(e => {
            setFormState(FormState.Fail);
            setResponseMessage("Something went wrong, please try again in a moment.")
            console.log(e);
        })
    }

    return (
        <React.Fragment>
            <form onSubmit={HandleSubmit}>
                <div className="inline-two-input">
                    <label>
                        <input type="text" name="name" placeholder="Name" onChange={HandleInputChange} value={name}/>
                    </label>
                    <label>
                        <input type="email" name="email" placeholder="Email" onChange={HandleInputChange} value={email}/>
                    </label>
                </div>
                <label className="fill">
                    <textarea name="message" placeholder="Message" onChange={HandleTextAreaChange} value={message}/>
                </label>
                <button className="secondary" type="submit" onSubmit={HandleSubmit}>connect</button>
            </form>
            <div id={"contact-response"}>{responseMessage}</div>
        </React.Fragment>
    )
};

ReactDOM.render(<ContactForm apiEndpoint={"https://faas.dominicsore.com/danisenior/contact"} />, document.getElementById("contact-form-app"));