async function getOrder(order_hash){
    // const response = await fetch(`https://s.btpc.vn/backend/api/getOrderDetail?order_hash=${order_hash}`);
    const response = await fetch(`https://apidonhang.aothun247.vn/getOrderDetail?order_hash=${order_hash}`);
    const res_json = await response.json();
    if(!response.ok) 
        throw new Error(JSON.stringify(res_json));
    return res_json;
}

module.exports = getOrder;