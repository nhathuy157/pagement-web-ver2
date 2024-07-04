import React, { useState, useEffect } from 'react'
import classes from './DetailsProduct.module.css'
import InfoITem from '../../components/InfoItem/InfoITem'
import Button from '../../components/Button/Button'
import ThienTrang from '../../assets/ThienTrang.png'
import { Link, useLocation, useNavigate   } from 'react-router-dom'
import backBtn from '../../assets/ArrowLeft.png'
import getOrder from '../PaymentPage/GetOrder.js'

export default function DetailsProduct() {
    // const detailsInfo = {
    //     info: {
    //         name: "Áo sơ mi barber kaki thun màu đen",
    //         material: "Cotton",
    //         color: "#12545",
    //         print: "Có / Không + Vị trí",
    //         Rent: "Có / Không + Vị trí",
    //         quantity: 10,
    //     },
    //     total: {
    //         price: "1,780,000",
    //         deposit: "890,000"
    //     }
    // }

    const navigate = useNavigate();

    const handleBackClick = () => {
        window.location.href = document.URL.replace('DetailsProduct','');
        // navigate(-1);
        // console.log('back btn');
    };


    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
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
                const data = await getOrder(orderHash);
                setDetailsInfo(data.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
                feting = false;
            }
        }

        !feting && fetchOrder();
    }, []);

    if(!orderHash) return "order_hash không hợp lệ";

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
    if(!product) return "index không hợp lệ";


    return (
        <div className={classes.box_padding}>
            <div className={`grid wide ${classes.container}`}>
                <div className={classes.head}>
                    <button onClick={handleBackClick} className={classes.backBtn}>
                        <img src={backBtn} />
                    </button>
                    <h1>Chi tiết sản phẩm</h1>
                    {/* {
                stateDetais ? (<p onClick={SetDetails}>Ẩn</p>) : (<p onClick={SetDetails}>Xem</p>)
            } */}

                </div>
                <div className={`${classes.listInfoOn}`}>
                    <ul className={classes.listInfo}>

                        <InfoITem title="Tên sản phẩm" content={product.name} />
                        <InfoITem title="Chất liệu" content={product.material.name || "không"} />
                        <InfoITem title="Màu sắc" content={product.color || "không"} />
                        <InfoITem title="In" content={product.print || "không"} />
                        {/* <InfoITem title="Thêu" content={product.Rent} /> */}
                        <InfoITem title="Số lượng" content={product.number} />
                        <InfoITem darkColor={true} title="Tổng tiền" content={(product.number * product.money).toLocaleString('it-IT', {style : 'currency', currency : 'VND'})} />
                        {/* <InfoITem darkColor={true} title="Cọc ( %50)" content={detailsInfo.total.deposit} /> */}
                    </ul>
                    {/* <div className={classes.box_btn}>
                        <Link to={'/'}>

                            <Button className={classes.btn}>
                                Trở về
                            </Button>
                        </Link>
                    </div> */}
                    <div className={classes.box_img}>
                        <img className={classes.img} src={ThienTrang} />
                    </div>
                </div>
                <p className='darkColor' style={{ textAlign: 'center', padding: '30px 0 10px 0' }}>
                    Lưu ý : Nếu đơn hàng có vấn đề, hoặc không đúng yêu cầu của mình liên hệ số điện thoại/ zalo : {customer.assign.phone} để được nhân viên hỗ trợ
                </p>
            </div>
        </div>
    )
}
