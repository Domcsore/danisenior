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
    Waiting = "waiting",
    Sending = "sending",
    Success = "success",
    Failed = "failed"
}

const ContactForm:React.FunctionComponent<ContactFormProps> = (props: ContactFormProps) => {
    const [name, setName] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [message, setMessage] = React.useState("");
    const [formState, setFormState] = React.useState(FormState.Waiting);

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

        setFormState(FormState.Sending);

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
                setFormState(FormState.Failed);
                response.json().then(e => console.log(e));
            } else {
                setFormState(FormState.Success);
                console.log("success");
            }
        }).catch(e => {
            console.log(e);
        })

    }

    return (
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
            <button className={`secondary ${formState}`} type="submit" onSubmit={HandleSubmit}>connect</button>
        </form>
    )
};

ReactDOM.render(<ContactForm apiEndpoint={"https://faas.dominicsore.com/danisenior/contact"} />, document.getElementById("contact-form-app"));