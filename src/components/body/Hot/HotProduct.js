import { TablePagination } from "@mui/material";
import { unwrapResult } from "@reduxjs/toolkit";
import { filter } from "lodash";
import React, { useEffect, useState } from "react";
import { connect, useDispatch } from "react-redux";
import { Link, NavLink } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getAllProduct,
  getToTalCart,
} from "../../../redux/actions/productAction";
import { getProduct } from "../../../redux/reducers/productReducer";
import { getRegions } from "../../../redux/reducers/region";
import {
  getCartItems,
  removeCartItems,
  setCartItems,
} from "../../../utils/storeSession";
import { fCurrency } from "../../utils/FormatCost";
import Loading from "../../utils/Loading/Loading";

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

const HotProduct = ({ listProducts, getAllProduct, getToTalCart }) => {
  const [regions, setRegions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(16);
  const [order] = useState("asc");
  const [orderBy] = useState("name");
  const [filterName, setFilterName] = useState("");
  const [products, setProducts] = useState([]);
  const [isAdd, setIsAdd] = useState(0);
  const [search, setSearch] = useState("");

  const dispatch = useDispatch();

  useEffect(() => {
    getAllProduct();
  }, [total]);

  useEffect(() => {
    getToTalCart(getCartItems());
  }, [isAdd]);

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      const res = await dispatch(getProduct());
      const resRegion = await dispatch(getRegions());
      unwrapResult(resRegion);
      setRegions(resRegion.payload["$values"]);
      setProducts(res.payload);
      unwrapResult(res);
    } catch (e) {
      console.log(e);
    }
  };

  function applySortFilter(array, comparator, query) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) {
        return order;
      }
      return a[1] - b[1];
    });
    if (query) {
      return filter(array, (item) => {
        if (item.product.name) {
          return search !== ""
            ? item.product.name.toLowerCase().indexOf(query.toLowerCase()) !==
                -1
            : item.product.regionId === query;
        }
      });
    }
    return stabilizedThis.map((el) => el[0]);
  }

  const handleAddToCart = (item) => {
    let isCart = isAdd + 1;
    setIsAdd(isCart);
    let id = item.product.id;
    let price = 0;

    if (item.product.priceSale > 0) {
      price = item.product.priceSale;
    } else {
      price = item.product.price;
    }

    const cartItems = getCartItems();

    let indexItemInCart = cartItems.findIndex((item) => item.id === id);

    if (indexItemInCart > -1) {
      cartItems.splice(indexItemInCart, 1, {
        id: item.product.id,
        amount: cartItems[indexItemInCart].amount + 1,
        name: item.product.name,
        image: item.image,
        price: price,
      });

      toast.success("Cập nhật giỏ hàng");

      getToTalCart();
    } else {
      cartItems.push({
        id: item.product.id,
        amount: 1,
        name: item.product.name,
        image: item.image,
        price: price,
      });

      toast.success("Thêm giỏ hàng thành công");
      getToTalCart();
    }

    removeCartItems();
    setCartItems(cartItems);
  };

  const handleFilterByName = (event) => {
    setFilterName(search ? event.target.value : +event.target.value);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    window.scrollTo(0, 0);
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredProducts = applySortFilter(
    products,
    getComparator(order, orderBy),
    filterName
  );

  const dataOfPage = filteredProducts
    .filter(
      (item) => item.product.name !== undefined && item.product.checkHotProduct
    )
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <>
      <Loading />
      <ToastContainer
        position="bottom-left"
        autoClose={1000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div>
        <div className="inner-banner-area">
          <div className="container">
            <div
              className="row align-items-center"
              style={{ paddingBottom: 30 }}
            >
              <div className="col-lg-5 col-md-5">
                <div className="inner-content">
                  <h2>Sản phẩm HOT</h2>
                  <ul>
                    <li>
                      <Link to="/">
                        <a href="">Trang chủ</a>
                      </Link>
                    </li>
                    <li>Sản phẩm HOT</li>
                  </ul>
                </div>
              </div>
              <div className="col-lg-7 col-md-7">
                <div className="inner-img">
                  <img
                    style={{ maxWidth: 450 }}
                    src="assets/images/offer-img/png5.png"
                    alt="Images"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="product-area pt-100 pb-70">
          <div className="container">
            <div className="product-topper">
              <div className="row">
                <div className="col-lg-4 col-md-4">
                  <div className="product-topper-title">
                    <h3 className="hot_text">
                      <NavLink
                        activeClassName="active"
                        to="/hot_product"
                        className="nav-link"
                      >
                        <i class="bx bxs-hot"></i>
                        Tất cả sản phẩm HOT
                      </NavLink>
                    </h3>
                  </div>
                </div>
                <div className="col-lg-4 col-md-4">
                  <div className="nav-bottom-form-area">
                    <div className="nav-bottom-form">
                      <input
                        type="text"
                        className="form-control"
                        value={search}
                        onChange={(e) => {
                          setSearch(e.target.value);
                          handleFilterByName(e);
                        }}
                        placeholder="Nhập tên sản phẩm bạn muốn tìm"
                      />
                    </div>
                  </div>
                </div>
                <div className="col-lg-4 col-md-4">
                  <div className="product-category chose-product-cate">
                    <div className="form-group">
                      <select
                        className="form-control"
                        onChange={(e) => handleFilterByName(e)}
                      >
                        <option value="">Chọn vùng miền sản phẩm</option>
                        {regions.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              {dataOfPage.length > 0 ? (
                dataOfPage.map((item, index) => {
                  if (item.product.name) {
                    return (
                      <div key={index} className="col-lg-3 col-sm-6">
                        <div className="product-item">
                          <div className="product-img">
                            <Link to={`/detail-products/${item.product.id}`}>
                              <img
                                src={
                                  process.env.REACT_APP_HOST +
                                  `/uploads/${item.image}`
                                }
                                alt="Product Images"
                              />
                            </Link>
                            <div className="hot-icon">
                              <img src="assets/images/hot_icon.png" alt="" />
                            </div>
                            {item.product.priceSale > 0 && (
                              <div className="product-item-tag">
                                <h3>
                                  {(
                                    100 -
                                    (item.product.priceSale * 100) /
                                      item.product.price
                                  ).toFixed(0)}
                                  %
                                </h3>
                              </div>
                            )}
                            <ul className="product-item-action">
                              <li>
                                <Link
                                  to={`/detail-products/${item.product.id}`}
                                >
                                  <i className="bx bx-zoom-in" />
                                </Link>
                              </li>
                              <li>
                                <a onClick={() => handleAddToCart(item)}>
                                  <i className="bx bx-cart" />
                                </a>
                              </li>
                            </ul>
                          </div>
                          <div className="content">
                            <h3>
                              <Link to={`/detail-products/${item.product.id}`}>
                                {item.product.name}{" "}
                              </Link>
                            </h3>
                            <span>
                              {item.product.priceSale > 0 ? (
                                <div>
                                  <div>
                                    {fCurrency(item.product.priceSale)} /{" "}
                                    {item.product.dvt} / {item.product.weight}{" "}
                                  </div>
                                </div>
                              ) : (
                                <>
                                  {fCurrency(item.product.price)} /{" "}
                                  {item.product.dvt} / {item.product.weight}{" "}
                                </>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                })
              ) : (
                <center>
                  <img src="/assets/images/found.gif" height="200px" alt="" />
                  <h2>Oh! Không tìm thấy sản phẩm nào...</h2>
                </center>
              )}
              <div className="col-lg-12 col-md-12 text-end">
                <TablePagination
                  rowsPerPageOptions={[20, 36, 44]}
                  component="div"
                  count={products.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const mapStateToProps = (state) => ({
  listProducts: state.product,
});

const mapDispatchToProps = {
  getAllProduct,
  getToTalCart,
};

export default connect(mapStateToProps, mapDispatchToProps)(HotProduct);
