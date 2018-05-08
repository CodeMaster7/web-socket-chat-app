import React from 'react'

export default function (props) {
    return (
        <div>
            <div style={{ textAlign: 'left', color: "#999" }}>{props.message.username} {props.message.timestamp} </div>
            <div>{props.message.message}</div>

        </div>
    )
}