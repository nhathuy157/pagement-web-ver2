import React from 'react'
import classes from './Navbar.module.css'
import Button from '../Button/Button'
import zalo_icon from '../../assets/img/zalo_icon.png'

import dataRef from '../Config/config.js'
function getLogo() {
    const brandName = (document.URL.match(/https:\/\/donhang\.(\w+?)\./) || [])[1];
    const ref = brandName || new URLSearchParams(document.URL).get('ref');
    const brand = (ref && Object.keys(dataRef).includes(ref)) ? dataRef[ref] : dataRef['default'];
    return brand.logo;
}

export default function Navbar() {

    return (
        <div className={classes.container}>
            <div className={`grid wide ${classes.nav}`}>
                <div>
                    <img src={getLogo()} />
                </div>
                {/* <p>
                    Lưu ý : Khánh hàng vui lòng xem kỹ lại thông tin đơn hàng. Nếu có sai sót vui vòng liên hệ số: <span id="zalo_number"></span> hoặc nhấn biểu tượng zalo để được hỗ trợ
                </p>
                <a href="#" id="link_zalo_number" rel="noopener" target="_blank" class="ml-2">
                    <img src={zalo_icon} />
                </a> */}
            </div>

        </div>
    )
}
