import React, { useRef, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import ReCAPTCHA from "react-google-recaptcha"

const RECAPTCHA_KEY = "6LcHZ7IZAAAAAJnmo93vjgv3FzZeubeCqhhTYWd5"
const encode = data => {
  return Object.keys(data)
    .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
    .join("&")
}
const ContactForm = () => {
  const { register, handleSubmit, errors, setValue } = useForm({
    mode: "onChange"
  })
  const [feedbackMsg, setFeedbackMsg] = useState(null)
  let captchaRef = useRef(null)

  useEffect(() => {
    register({ required: "Required", name: "g-recaptcha-response" })
  }, [register])
  const onSubmit = (data, e) => {
    e.preventDefault()
    const captchaValue = captchaRef.current.getValue()

    if (!captchaValue) {
      console.log("CAPTCHA Missing!")
      setFeedbackMsg("Select 'I'm not a robot'")
      return
    }
    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: encode({
        "form-name": "contact",
        "g-recaptcha-response": captchaValue,
        ...data
      })
    })
      .then(response => {
        e.target.reset()
        setFeedbackMsg("Sucess, Message Send!")
      })
      .catch(error => {
        setFeedbackMsg("Oops, Error!")
        console.log(error)
      })
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)} name="contact" method="post">
      <label for="name">
        <p>Name:</p>
        <input
          type="text"
          id="name"
          name="name"
          placeholder="Your Name"
          ref={register({
            required: "Required Field",
            maxLength: {
              value: 10,
              message: "Max. 10 characters"
            }
          })}
        />
        {errors.name && <span>{errors.name.message}</span>}
      </label>
      <label for="email">
        <p>Email:</p>
        <input
          type="text"
          id="email"
          placeholder="Your Email"
          name="email"
          ref={register({
            required: "Required Field",
            pattern: {
              value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
              message: "Invalid Email"
            }
          })}
        />
        {errors.email && <span>{errors.email.message}</span>}
      </label>
      <label for="message">
        <p>Mensagem:</p>
        <textarea
          name="message"
          id="message"
          rows="5"
          cols="33"
          placeholder="Your Message ..."
          ref={register({
            required: "Required Field",
            maxLength: {
              value: 100,
              message: "Max. 100 characters"
            }
          })}
        />
        {errors.message && <span>{errors.message.message}</span>}
      </label>
      <ReCAPTCHA
        name="g-recaptcha-response"
        ref={captchaRef}
        sitekey={RECAPTCHA_KEY}
        onChange={val => {
          setValue("g-recaptcha-response", val, true)
        }}
      />
      {feedbackMsg && <h3>{feedbackMsg}</h3>}
      <br />
      <button type="submit">Send</button>
      <button type="reset">Reset</button>
    </form>
  )
}

export default ContactForm
