import logoAoThun247 from '../../assets/img/logoAoThun247.jpg'
import logoBTP from '../../assets/img/logoBTP.jpg'
import logoDPBTP from '../../assets/img/logoDPBTP.png'
import logodongphucTT from '../../assets/img/logodongphucTT.jpg'
import logoDefault from '../../assets/img/logoAoThun247.jpg' // Sử dụng khi không tìm đc logo
import logoVBC from '../../assets/img/VBClogo.png'
import logoVP from '../../assets/img/VPlogo.jpg'

const dataRef = {
    'aothun247': {
        sologan: 'Đơn giản là đẹp',
        favicon: logoAoThun247,
        logo: logoAoThun247,
        bank: {
            BANKID: 'VPB',
            BANKNAME: 'VPBank - Ngân hàng TMCP Việt Nam Thịnh Vượng',
            BANKLOGO: logoVP,
            ACCOUNT_NO: 118833333,
            ACCOUNT_NAME: 'PHAN THỊ HẠNH'
        }
    },
    'dongphucbtp': {
        sologan: 'Giải pháp đồng phục doanh nghiệp',
        favicon: logoDPBTP,
        logo: logoDPBTP,
        bank: {
            BANKID: 'VCB',
            BANKNAME: 'Vietcombank - Ngân hàng TMCP Ngoại Thương Việt Nam',
            BANKLOGO: logoVBC,
            ACCOUNT_NO: 3383777777,
            ACCOUNT_NAME: 'PHAN THỊ HẠNH'
        }
    },
    'thientrang': {
        sologan: 'Giải pháp đồng phục chuyên nghiệp',
        favicon: logodongphucTT,
        logo: logodongphucTT,
        bank: {
            BANKID: 'VCB',
            BANKNAME: 'Vietcombank - Ngân hàng TMCP Ngoại Thương Việt Nam',
            BANKLOGO: logoVBC,
            ACCOUNT_NO: 8386777777,
            ACCOUNT_NAME: 'PHAN THỊ HẠNH'
        }
    },
    'default': {
        sologan: 'Đơn giản là đẹp',
        favicon: logoAoThun247,
        logo: logoAoThun247,
        bank: {
            BANKID: 'VPB',
            BANKNAME: 'VPBank - Ngân hàng TMCP Việt Nam Thịnh Vượng',
            BANKLOGO: logoVP,
            ACCOUNT_NO: 118833333,
            ACCOUNT_NAME: 'PHAN THỊ HẠNH'
        }
    },
}

export default dataRef;