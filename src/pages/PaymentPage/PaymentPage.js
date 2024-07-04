import React, { useState, useEffect } from 'react';
import classes from './PaymentPage.module.css'
import Button from '../../components/Button/Button'
import ThienTrang from '../../assets/ThienTrang.png'
import QR from '../../assets/QR.png'
import NganHang from '../../assets/NganHang.png'
import lamp from '../../assets/lamp.png'
import InfoITem from '../../components/InfoItem/InfoITem'
import ProductItem from '../../components/ProductItem/ProductItem'
import { useLocation } from 'react-router-dom';
import getOrder from './GetOrder.js'
import Swal from 'sweetalert2';
import dataRef from '../../components/Config/config.js';

export default function PaymentPage() {
    const [stateDetais, setsStateDetais] = useState(true)
    function SetDetails() {
        setsStateDetais(!stateDetais)
    }
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const orderHash = queryParams.get('order_hash');

    const brandName = (document.URL.match(/https:\/\/donhang\.(\w+?)\./)||[])[1];
    const ref = brandName || queryParams.get('ref');
    const brand = (ref && Object.keys(dataRef).includes(ref)) ? dataRef[ref] : dataRef['default'];
    const BankInfo = brand.bank || dataRef.default.bank;
    // alert(document.URLSearchParams);

    const [detailsInfo, setDetailsInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    let feting = false; // tránh bị trùng lặp request
    useEffect(() => {
        async function fetchOrder() {
            try {
                feting = true;
                const data = await getOrder(orderHash);
                setDetailsInfo(data.data);

                // set lại sdt trên thanh nav
                const script = document.createElement('script');
                script.innerHTML = `
                    document.querySelector('#zalo_number').innerHTML = '${data.data.customer.assign.phone}';
                    document.querySelector('#link_zalo_number').href = 'https://zalo.me/' + '${data.data.customer.assign.phone}';
                    `;
                document.body.appendChild(script);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
                feting = false;
            }
        }

        !feting && fetchOrder();
    }, []);

    // update thông tin sau mỗi phút khi có thay đổi
    const [isChecking, setIsChecking] = useState(false);
    const [isStop, setIsStop] = useState(false);
    const format = number => number.toLocaleString('it-IT', { style: 'currency', currency: 'VND' });
    useEffect(() => {
        const showSuccessAlert = (text, callback) => {
            Swal.fire({
                title: 'Thông báo',
                text: text,
                icon: 'success',
                confirmButtonText: 'OK',
            }).then(callback);
        };


        // Hàm kiểm tra điều kiện
        const checkCondition = async () => {
            console.log('checkCondition');
            if (isChecking || isStop) return; // Nếu đang kiểm tra, bỏ qua lần gọi mới
            if (['đã gửi', 'hoàn thành'].includes(detailsInfo?.status.text.toLocaleLowerCase())){ setIsStop(true); return }; // Nếu đã gửi thì không update
            setIsChecking(true);
            try {
                const data = await getOrder(orderHash);
                // debugger;
                if (detailsInfo && data.success && JSON.stringify(data.data) !== JSON.stringify(detailsInfo)) { // Nếu data có thay đổi
                    // Nếu thay đổi về số tiền
                    if (data.data.totalPay !== detailsInfo.totalPay && data.data.totalPay == 0) {
                        setIsStop(true);
                        const paymentAmount = detailsInfo.totalPay - data.data.totalPay; // tiền trước trừ tiền sau
                        showSuccessAlert("Thanh toán thành công số tiền " + format(paymentAmount), (result) => {
                            if (result.isConfirmed) {
                                window.location.reload(); // reload lại trang
                            }
                          });
                    }
                    else{
                        window.location.reload(); // reload lại trang
                    }
                }
            } catch (err) {
                console.error(err);
            }
            finally {
                setIsChecking(false); // Kết thúc kiểm tra
            }
        };
    
        // Thiết lập interval để kiểm tra điều kiện mỗi 60 giây
        const intervalId = setInterval(checkCondition, 60*1000);
    
        // Dọn dẹp interval khi component bị unmount
        return () => clearInterval(intervalId);
    }, [isChecking]); //Chạy lại effect nếu isChecking thay đổi

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
        ships,
        status,
    } = detailsInfo;
    const deposit = totalMoneyAfterVATorDiscount - totalPay;
    const depositRatio = Math.round(deposit / totalMoneyAfterVATorDiscount * 100);

    const totalAmountFormat = format(totalMoneyAfterVATorDiscount);
    const depositFormat = format(deposit);
    const VATFormat = format(totalVAT);
    const totalPayFormat = format(totalPay);

    const employeeName = [customer.assign.last_name, customer.assign.first_name].join(' ').trim();

    return (
        <div className={`${classes.Payment}`}>
            <div className={`l-8 c-12 ${classes.container}`}>
                <div className={classes.head}>
                    <h1 className='darkColor'>Thông tin đơn hàng</h1>
                    {
                        stateDetais ? (<p onClick={SetDetails}>Ẩn</p>) : (<p onClick={SetDetails}>Xem</p>)
                    }
                </div>
                <div className={stateDetais ? `${classes.listInfoOn}` : `${classes.listInfoOff}`}>
                    <ul className={classes.listInfo}>
                        <InfoITem title="Khách hàng" content={detailsInfo.customer.name} />
                        <InfoITem title="Nhân viên" content={employeeName} />
                        <InfoITem title="Số điện thoại" content={detailsInfo.customer.phone} />
                        <InfoITem title="Địa chỉ" content={detailsInfo.customer.address} />

                        <InfoITem darkColor={true} title="Tổng tiền" content={totalAmountFormat + ` (VAT: ${VATFormat})`} />
                        <InfoITem darkColor={true} title="Đã thanh toán" content={depositFormat + ` (${depositRatio}%)`} />
                        <InfoITem darkColor={true} title="Cần thanh toán" content={totalPayFormat} />
                    </ul>
                    <div className={classes.box_btn}>
                        <p className='darkColor'>Trạng thái</p>
                        <div>
                            <Button className={ ['đã gửi', 'hoàn thành'].includes(status.text.toLocaleLowerCase()) ? classes.btn_stt_success : classes.btn_stt_warning}>
                                {status.text}
                                {/* //chờ duyệt, đang sản xuất, đã sản xuất, đang gửi, đã gửi, hoàn thành */}
                            </Button>
                            <a href='#QR' onClick={SetDetails}>
                                <Button className={`l-0 c-12 ${classes.btn}`}>
                                    Thanh Toán
                                </Button>
                            </a>
                        </div>
                    </div>
                    {/* <div className={classes.box_img}>
                            <img className={classes.img} src={ThienTrang} />
                        </div> */}
                    {/* {totalPay > 0 && (
                        <p className='darkColor' style={{ textAlign: 'center', padding: '30px 0 10px 0' }}>
                            Lưu ý : Khánh hàng vui lòng thanh toán số tiền cọc theo đã ghi trong đơn hàng để hệ thống tiến hành duyệt đơn.
                        </p>
                    )} */}
                    <div className={classes.products}>
                        <h1 className='darkColor'>
                            Danh sách sản phẩm
                        </h1>
                        <div className={classes.product_list}>
                            {
                                detailsInfo.products.map((e, i) => (
                                    <>
                                        <ProductItem index={i} content={e} />
                                    </>
                                ))
                            }
                        </div>
                    </div>

                </div>

            </div>

            {totalPay > 0 && ( // Đã thanh toán thì ẩn QR đi
                <div className={`l-4 c-12 ${classes.qrpay}`}>
                    <div id='QR' className={`${classes.container}`}>
                        <div className={classes.Payhead}>
                            {/* <img src={lamp} /> */}
                            <p className='darkColor'>
                                Mã QR thanh toán
                            </p>

                        </div>
                        <div className={`${classes.pay_container}`}>
                            <div className={` ${classes.box_QR}`}>
                                <img className={classes.QR_img} src={`https://img.vietqr.io/image/${BankInfo.BANKID}-${BankInfo.ACCOUNT_NO}-compact.png?amount=${totalPay}&addInfo=${detailsInfo.code + " Thanh toan don hang"}&accountName=${BankInfo.ACCOUNT_NAME}`} />

                            </div>
                            <div className=''>
                                <div className={classes.pay_container_right}>
                                    <div className={classes.bank}>
                                        <img src={BankInfo.BANKLOGO} />
                                        <div>
                                            {/* <p>
                                                Ngân hàng
                                            </p> */}
                                            <p className='darkColor'>
                                            {BankInfo.BANKNAME}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={classes.box_flex}>
                                        <p>
                                            Chủ tài khoản:
                                        </p>
                                        <p className='darkColor'>
                                            {BankInfo.ACCOUNT_NAME}
                                        </p>
                                    </div>
                                    <div className={`row`}>
                                        <div className={`col l-7 c-7 ${classes.box_flex}`}>
                                            <p>
                                                Số tài khoản:
                                            </p>
                                            <p className='darkColor'>
                                                {BankInfo.ACCOUNT_NO}
                                            </p>
                                        </div>
                                        <div className={`col l-5 c-5 ${classes.box_btn_pay}`}>

                                            <Button className={classes.btn_pay}>Sao chép</Button>
                                        </div>

                                    </div>
                                    <div className={`row`}>
                                        <div className={`col l-7 c-7 ${classes.box_flex}`}>
                                            <p>
                                                Số tiền:
                                            </p>
                                            <p className='darkColor'>
                                                {totalPayFormat}
                                            </p>
                                        </div>
                                        <div className={`col l-5 c-5 ${classes.box_btn_pay}`}>

                                            <Button className={classes.btn_pay}>Sao chép</Button>
                                        </div>
                                    </div>
                                    <div className={`row`}>
                                        <div className={`col l-7 c-7 ${classes.box_flex}`}>
                                            <p>
                                                Nội dung:
                                            </p>
                                            <p className='darkColor'>
                                                {detailsInfo.code}
                                            </p>
                                        </div>
                                        <div className={`col l-5 c-5 ${classes.box_btn_pay}`}>

                                            <Button className={classes.btn_pay}>Sao chép</Button>
                                        </div>
                                    </div>
                                    <Button className={`l-0 c-12 ${classes.btn_QR}`}>
                                        Thanh toán ngay
                                    </Button>
                                </div>

                            </div>
                        </div>
                        {/* <div className={`row ${classes.note}`}>
                        <div className={`col l-6 c-12 ${classes.note_btn}`}>
                            <Button className={classes.btn_QR}>
                                Hủy
                            </Button>
                        </div>
                        <div className={`col l-6 c-12 ${classes.PayNote}`}>
                            <p>s
                                Lưu ý : Nhập chính xác số tiền
                            </p>
                            <span className='darkColor'>
                                {totalPayFormat}
                            </span>
                            <p>
                                , nội dung
                            </p>
                            <span className='darkColor'>
                                {detailsInfo.code}
                            </span>
                            <p>
                                khi chuyển khoản
                            </p>
                        </div>
                    </div> */}
                    </div>
                    <div className={`${classes.container} ${classes.transport}`}>
                        <p className='darkColor'>Vận chuyển và nhận hàng</p>
                        <p>
                            Mã vận chuyển : { ships.track || "Chưa có thông tin" }
                        </p>
                        <p>
                            Đơn vị vận chuyển : { ships.delivery?.text || "Chưa có thông tin" }
                        </p>
                        <p>
                            Dự kiến nhận hàng : { new Date(detailsInfo.deadline).toLocaleDateString('en-DE') }
                        </p>
                        <p>
                            Phí vận chuyển : { ships.freeShip ? "Miễn phí" : "Khách hàng trả" }
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
