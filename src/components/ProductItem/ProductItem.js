import React from 'react'
import classes from './ProductItem.module.css'
import Button from '../Button/Button'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import placeholder_image from '../../assets/img/no-image-available.png'
export default function ProductItem(props) {
    return (
        <Link to={'/DetailsProduct' + window.location.search + "&index=" + props.index} className={`${classes.container}`}>

            <div className={classes.inf}>
                <div className={classes.box_img}>
                    <img src={props.content.image || placeholder_image} />
                    {/* <div className={classes.rectangleDiv} /> */}
                </div>
                <div className={classes.inf_content}>
                    <p>
                        Tên sản phẩm: {props.content.name}
                    </p>
                    <p>
                        Số lượng: {props.content.number}
                    </p>
                    <p>
                        Giá: {props.content.money.toLocaleString('it-IT', { style: 'currency', currency: 'VND' })}
                    </p>
                </div>
            </div>
            {/* <Link> */}
            <Link to={'/DetailsProduct' + window.location.search + "&index=" + props.index}>
                {/* // to={'/DetailsProduct'} */}
                <Button className={classes.btn}>
                    Xem Thêm
                </Button>
            </Link>
        </Link>
    )
}
