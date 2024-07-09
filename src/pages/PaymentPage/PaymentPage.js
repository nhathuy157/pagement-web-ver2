import React, { useState, useEffect } from 'react';
import classes from './PaymentPage.module.css'
import Button from '../../components/Button/Button'
import ThienTrang from '../../assets/img/ThienTrang.png'
import QR from '../../assets/img/QR.png'
import NganHang from '../../assets/img/NganHang.png'
import lamp from '../../assets/img/lamp.png'
import InfoITem from '../../components/InfoItem/InfoITem'
import ProductItem from '../../components/ProductItem/ProductItem'
import { useLocation } from 'react-router-dom';
import getOrder from './GetOrder.js'
import Swal from 'sweetalert2';
import dataRef from '../../components/Config/config.js';
import zalo_icon from '../../assets/img/zalo_icon.png'
import phone_icon from '../../assets/img/Phone.png'
import fb_icon from '../../assets/img/Facebook.png'
import iconCheck from '../../assets/img/iconscheck.png'
import iconSupport from '../../assets/img/iconsSupport.png'
import iconPayment from '../../assets/img/iconsPayment.png'
import ReactCardFlip from 'react-card-flip';

export default function PaymentPage() {
    const [statePayment, setsStatePayment] = useState(true);
    function SetPayments() {
        setsStatePayment(!statePayment)
    }

    const showSuccessAlert = (text, status = 'success', callback) => {
        Swal.fire({
            title: 'Thông báo',
            text: text,
            icon: status,
            confirmButtonText: 'OK',
        }).then(callback);
    };

    function copyTextToClipboard(text, btn) {
        // Tạo một phần tử textarea ẩn để chứa văn bản cần sao chép
        const textarea = document.createElement('textarea');
        textarea.value = text;

        // Đảm bảo rằng phần tử textarea này không hiển thị trên màn hình
        textarea.style.position = 'fixed';
        textarea.style.opacity = 0;

        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();

        try {
            // Sao chép văn bản vào clipboard
            const successful = document.execCommand('copy');
            if(!successful) throw new Error("Trình duyệt không hỗ trợ copy");
            // const msg = successful ? 'successful' : 'unsuccessful';
            // console.log('Đã sao chép thành công  ' + msg);
            // showSuccessAlert('Đã sao chép thành công: ' + text, 'success');
            btn.innerText = "Đã sao chép";
            btn.classes.add(classes.btn_copy_success);
        } catch (err) {
            // console.error('Oops, hình như có lỗi gì đó xin vui lòng thử lại', err);
            // showSuccessAlert('Oops, hình như có lỗi gì đó xin vui lòng thử lại: ' + err.message, 'error');
        }

        // Xóa phần tử textarea sau khi sao chép
        document.body.removeChild(textarea);
    }

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const orderHash = queryParams.get('order_hash');

    const brandName = (document.URL.match(/https:\/\/donhang\.(\w+?)\./) || [])[1];
    const ref = brandName || queryParams.get('ref');
    const brand = (ref && Object.keys(dataRef).includes(ref)) ? dataRef[ref] : dataRef['default'];
    const BankInfo = brand.bank || dataRef.default.bank;
    if(brand.favicon) document.querySelector('link[rel="icon"]').href = brand.favicon;// sửa favicon

    if(brand.sologan) document.querySelector('meta[name="description"]').content = brand.sologan;

    // alert(document.URLSearchParams);

    const [detailsInfo, setDetailsInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    let feting = false; // tránh bị trùng lặp request
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

    // update thông tin sau mỗi phút khi có thay đổi
    const [isChecking, setIsChecking] = useState(false);
    const [isStop, setIsStop] = useState(false);
    const format = number => number.toLocaleString('it-IT', { style: 'currency', currency: 'VND' });
    useEffect(() => {
        // Hàm kiểm tra điều kiện
        const checkCondition = async () => {
            console.log('checkCondition');
            if (isChecking || isStop) return; // Nếu đang kiểm tra, bỏ qua lần gọi mới
            if (['đã gửi', 'hoàn thành'].includes(detailsInfo?.status.text.toLocaleLowerCase())) { setIsStop(true); return }; // Nếu đã gửi thì không update
            setIsChecking(true);
            try {
                while(document.hidden) await new Promise(r => setTimeout(r, 500)); // Chờ người dùng bật lại tab, nếu có thay đổi thì reload luôn.
                const data = await getOrder(orderHash);
                // debugger;
                if (detailsInfo && data.success && JSON.stringify(data.data) !== JSON.stringify(detailsInfo)) { // Nếu data có thay đổi
                    // Nếu thay đổi về số tiền
                    if (data.data.totalPay !== detailsInfo.totalPay && data.data.totalPay == 0) {
                        setIsStop(true);
                        const paymentAmount = detailsInfo.totalPay - data.data.totalPay; // tiền trước trừ tiền sau
                        showSuccessAlert("Thanh toán thành công số tiền " + format(paymentAmount),'success', (result) => {
                            if (result.isConfirmed) {
                                window.location.reload(); // reload lại trang
                            }
                        });
                    }
                    else {
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
        const intervalId = setInterval(checkCondition, 60 * 1000);

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
        <div className={`grid wide ${classes.Payment}`}>
            <div className={`l-8 c-12 ${classes.right}`}>
                <div>
                    {/* <div className={classes.head}>
                    <h1 className='darkColor'>Thông tin đơn hàng</h1>
                    {
                        stateDetais ? (<p onClick={SetDetails}>Ẩn</p>) : (<p onClick={SetDetails}>Xem</p>)
                    }
                </div>
                className={stateDetais ? `${classes.listInfoOn}` : `${classes.listInfoOff}`}
                */}
                    <div className={classes.info}>
                        <ul className={`${classes.listInfo} ${classes.container}`}>
                            <h1 className='textTitle'>
                                Khách hàng
                            </h1>
                            <InfoITem title="Khách hàng" content={detailsInfo.customer.name} />
                            <InfoITem title="Số điện thoại" content={detailsInfo.customer.phone} />
                            <InfoITem title="Địa chỉ" content={detailsInfo.customer.address} />

                        </ul>
                        <ul className={`${classes.listInfo} ${classes.container}`}>
                            <h1 className='textTitle'>
                                Nhân viên
                            </h1>
                            <InfoITem title="Nhân viên" content={employeeName} />
                            <InfoITem title="Số điện thoại" content={detailsInfo.customer.phone} />
                            <div className={classes.contact_img}>
                                <img src={zalo_icon} />
                                <img src={phone_icon} />
                                <img src={fb_icon} />
                            </div>
                        </ul>

                        {/* <div className={classes.box_img}>
                            <img className={classes.img} src={ThienTrang} />
                        </div> */}
                        {/* {totalPay > 0 && (
                        <p className='darkColor' style={{ textAlign: 'center', padding: '30px 0 10px 0' }}>
                            Lưu ý : Khánh hàng vui lòng thanh toán số tiền cọc theo đã ghi trong đơn hàng để hệ thống tiến hành duyệt đơn.
                        </p>
                    )} */}


                    </div>

                </div>
                <div className={`${classes.products} ${classes.container}`}>
                    <h1 className='textTitle'>
                        Danh sách sản phẩm
                    </h1>
                    <div className={classes.product_list}>
                        {
                            detailsInfo.products.map((e, i) => (
                                <div key={i}>
                                    <ProductItem index={i} content={e} />
                                </div>
                            ))

                        }

                    </div>

                    <div className={classes.stt}>
                        <div className={classes.box_btn}>
                            <p className=''>Trạng thái :</p>
                            <p className='textTitle'>
                                {status.text}
                            </p>
                            {/* <Button className={['đã gửi', 'hoàn thành'].includes(status.text.toLocaleLowerCase()) ? classes.btn_stt_success : classes.btn_stt_warning}>
                                {status.text}
                            </Button> */}
                            {/* <a href='#QR' onClick={SetDetails}>
                                <Button className={`l-0 c-12 ${classes.btn}`}>
                                    Thanh Toán
                                </Button>
                            </a> */}
                        </div>
                        <div className='c-10 l-6'>
                            <InfoITem darkColor={true} title="Tổng tiền" content={
                                <>
                                    {totalAmountFormat}
                                    <br />
                                    (VAT: {VATFormat})

                                </>
                            } />
                            <InfoITem darkColor={true} title="Đã thanh toán" content={depositFormat + ` (${depositRatio}%)`} />
                            <InfoITem darkColor={true} title="Cần thanh toán" content={<>{totalPayFormat} <br /> (Chưa bao gồm phí ship) </>} />

                        </div>
                    </div>
                </div>
            </div>

            {totalPay > 0 && ( // Đã thanh toán thì ẩn QR đi

                <div className={`${classes.qrpay}`}>
                    <ReactCardFlip flipDirection='horizontal' isFlipped={statePayment}>
                        <div id='QR' className={`${classes.container}`}>
                            <div className={classes.Payhead}>
                                {/* <img src={lamp} /> */}
                                <p className='textTitle'>
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
                                                <Button onClick={ function (event){ copyTextToClipboard(BankInfo.ACCOUNT_NO, event.currentTarget)} } className={classes.btn_pay}>Sao chép</Button>
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
                                                <Button onClick={ function (event){ copyTextToClipboard(totalPayFormat, event.currentTarget)} } className={classes.btn_pay}>Sao chép</Button>
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
                                                <Button onClick={ function (event){ copyTextToClipboard(detailsInfo.code, event.currentTarget)} } className={classes.btn_pay}>Sao chép</Button>
                                            </div>
                                        </div>
                                        <Button onClick={SetPayments} className={` ${classes.btn_QR}`}>
                                            Hủy
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={`${classes.container} ${classes.paymentMT}`}>
                            <div className={classes.box_flex}>
                                <img src={iconCheck} />
                                <p>
                                    Quý khách vui lòng kiểm tra lại thông tin cá nhân.
                                </p>
                            </div>
                            <div className={classes.box_flex}>
                                <p>
                                    Nếu có bất kỳ vấn đề gì với đơn hàng, xin vui lòng liên hệ ngay qua số điện thoại/Zalo: 0915 484 515 để được hỗ trợ nhanh chóng.
                                </p>
                                <img src={iconSupport} />
                            </div>
                            <div className={classes.box_flex}>
                                <img src={iconPayment} />
                                <p>
                                    Vui lòng thanh toán số tiền trong đơn hàng để chúng tôi có thể xử lý đơn hàng của Quý khách ngay lập tức.
                                </p>
                            </div>
                            <Button onClick={SetPayments}>
                                Thanh toán
                            </Button>
                        </div>
                    </ReactCardFlip>


                    <div className={`${classes.container} ${classes.transport}`}>
                        <p className='darkColor'>Vận chuyển và nhận hàng</p>
                        <p>
                            Mã vận chuyển : {ships.track || "Chưa có thông tin"}
                        </p>
                        <p>
                            Đơn vị vận chuyển : {ships.delivery?.text || "Chưa có thông tin"}
                        </p>
                        <p>
                            Dự kiến nhận hàng : {new Date(detailsInfo.deadline).toLocaleDateString('en-DE')}
                        </p>
                        <p>
                            Phí vận chuyển : {ships.freeShip ? "Miễn phí" : "Khách hàng thanh toán phí ship"}
                        </p>
                    </div>
                </div>



            )}
        </div>
    )
}
