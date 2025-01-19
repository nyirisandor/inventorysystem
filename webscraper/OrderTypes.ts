interface WebscraperOrder{
    orderDate : Date | null,
    ID : number | null,
    status : string,
    items : OrderItem[]
}


interface OrderItem{
    name : string,
    variant : string,
    priceCurrency : string,
    priceAmount : number | null,
    orderedAmount : number | null,
    link : string,
}