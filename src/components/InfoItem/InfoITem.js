import React from 'react'
import classes from './InfoItem.module.css'

export default function InfoITem(props) {
    return (
        <li className={`row ${classes.infoItem}`}>
            <p className={`col l-5 c-6 ${props.darkColor ? "darkColor" : ""}`}>
                {props.title}
            </p>
            <p className='col l-7 c-6 darkColor'>
                {props.content}
            </p>
        </li>
    )
}
