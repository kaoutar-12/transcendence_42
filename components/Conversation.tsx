import React from 'react'
import '@/styles/conversation.css'

type Props = {}

const Conversation = (props: Props) => {
  return (
    <div className="conversation">
        <div className="image"></div>
        <div className="main">
            <div className="name">John Doe</div>
            <div className="message">Hello, how are you?</div>
        </div>
        <div className="time">9:51</div>
    </div>
  )
}

export default Conversation