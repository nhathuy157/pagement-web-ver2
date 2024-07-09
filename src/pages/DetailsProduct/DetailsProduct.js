import React, { useState, useEffect } from 'react'
import classes from './DetailsProduct.module.css'
import InfoITem from '../../components/InfoItem/InfoITem'
import Button from '../../components/Button/Button'
import placeholder_image from '../../assets/img/no-image-available.png'
// import { Link, useLocation, useNavigate } from 'react-router-dom'
import backBtn from '../../assets/img/ArrowLeft.png'
import getOrder from '../PaymentPage/GetOrder.js'

export default function DetailsProduct() {
    const queryParams = new URLSearchParams(window.location.search);
    const orderHash = queryParams.get('order_hash');
    const index = queryParams.get('index');

    const [detailsInfo, setDetailsInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    let feting = false;
    useEffect(() => {
        async function fetchOrder() {
            try {
                feting = true;
                const data = window.data || await getOrder(orderHash).then(r=>r.data);
                window.data = data;
                setDetailsInfo(data);

                // set lại sdt trên thanh nav
                // const script = document.createElement('script');
                // script.innerHTML = `
                //     document.querySelector('#zalo_number').innerHTML = '${data.data.customer.assign.phone}';
                //     document.querySelector('#link_zalo_number').href = 'https://zalo.me/' + '${data.data.customer.assign.phone}';
                //     `;
                // document.body.appendChild(script);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
                feting = false;
            }
        }

        !feting && fetchOrder();
    }, []);

    if (!orderHash) return "order_hash không hợp lệ";

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    const {
        totalAccountAll, //tổng số tiền đã thanh toán ở đơn
        totalMoney, //tổng GTSP
        discount, //discound trước thuế
        totalVAT,
        totalMoneyAfterVATorDiscount,
        totalPay, //số tiền còn lại phải thanh toán
        customer,
        products,
    } = detailsInfo;
    const product = products[index];
    if (!product) return "index không hợp lệ";


    return (
        <div className={classes.box_padding}>
            <div className={`${classes.container}`}>
                <div className={classes.head}>
                    <button onClick={ ()=> {window.history.back()} } className={classes.backBtn}>
                        <img src={backBtn} />
                    </button>
                    <h1 className='textTitle'>Chi tiết sản phẩm</h1>
                    {/* {
                stateDetais ? (<p onClick={SetDetails}>Ẩn</p>) : (<p onClick={SetDetails}>Xem</p>)
            } */}

                </div>
                <div className={`${classes.listInfoOn} ${classes.box_flex}`}>
                    <div className={classes.box_img}>
                        <img className={classes.img} src={product.image || placeholder_image} />
                    </div>
                    <ul className={classes.listInfo}>

                        <InfoITem title="Tên sản phẩm" content={product.name} />
                        <InfoITem title="Chất liệu" content={product.material.name || "không"} />
                        <InfoITem title="Màu sắc" content={product.color || "không"} />
                        <InfoITem title="In" content={product.print || "không"} />
                        {/* <InfoITem title="Thêu" content={product.Rent} /> */}
                        <InfoITem title="Số lượng" content={product.number} />
                        <InfoITem darkColor={true} title="Tổng tiền" content={(product.number * product.money).toLocaleString('it-IT', { style: 'currency', currency: 'VND' })} />
                        {/* <InfoITem darkColor={true} title="Cọc ( %50)" content={detailsInfo.total.deposit} /> */}
                    </ul>
                    {/* <div className={classes.box_btn}>
                        <Link to={'/'}>

                            <Button className={classes.btn}>
                                Trở về
                            </Button>
                        </Link>
                    </div> */}

                </div>
                <p className='textTitle' style={{ textAlign: 'center', padding: '30px 0 10px 0' }}>
                    Lưu ý : Nếu đơn hàng có vấn đề, hoặc không đúng yêu cầu của mình liên hệ số điện thoại/ zalo : {customer.assign.phone} để được nhân viên hỗ trợ
                </p>
            </div>
        </div>
    )
}
