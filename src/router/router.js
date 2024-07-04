import React from 'react'
import { createBrowserRouter } from "react-router-dom";
import PaymentPage from '../pages/PaymentPage/PaymentPage';
import DetailsProduct from '../pages/DetailsProduct/DetailsProduct';
const Router = createBrowserRouter([
    {
        path: "/",
        element: <PaymentPage />,
    },
    {
        path: "/DetailsProduct",
        element: <DetailsProduct />,
    },
]);

export default Router;