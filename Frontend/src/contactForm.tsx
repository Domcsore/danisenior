import * as React from 'react';
import * as ReactDOM from 'react-dom';

function ContactForm() {
    return (
        <form>
        <div className="inline-two-input">
            <label>
                <input type="text" name="name" placeholder="Name"/>
            </label>
            <label>
                <input type="email" name="email" placeholder="Email"/>
            </label>
        </div>
        <label className="fill">
            <textarea name="message" placeholder="Message"></textarea>
        </label>
        <button className="secondary" type="submit">connect</button>
    </form>
    )
}

ReactDOM.render(<ContactForm />, document.getElementById("contact-form-app"));