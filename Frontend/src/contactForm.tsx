import 'core-js';
import 'whatwg-fetch';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

type ContactFormProps = {
    apiEndpoint: string
}

const ContactForm:React.FunctionComponent<ContactFormProps> = ({apiEndpoint: string}) => {
    const [name, setName] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [message, setMessage] = React.useState("");

    function HandleTextAreaChange(e: React.FormEvent<HTMLTextAreaElement>) {
        const target = e.target as HTMLTextAreaElement;
        setMessage(target.value);
    }

    function HandleInputChange(e: React.FormEvent<HTMLInputElement>) {
        const target = e.target as HTMLTextAreaElement;
        switch(target.name) {
            case "name":
                setName(target.value)
                break;
            case "email":
                setEmail(target.value)
                break;
        }
    }

    function HandleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const params = (new URL(location.href)).searchParams;
        let ref = params.get("ref") ? params.get("ref") : "home";

        console.log(ref);

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
            <button className="secondary" type="submit" onSubmit={HandleSubmit}>connect</button>
        </form>
    )
};

ReactDOM.render(<ContactForm apiEndpoint={"faas.dominicsore.com/danisenior/contact"} />, document.getElementById("contact-form-app"));