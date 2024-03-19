import datetime
from django.test import TestCase, Client
import json
import jwt
from bson.objectid import ObjectId
from utils import connect_collection
from django.urls import reverse
from jwt import encode

############## Start Of First Demo Test Cases ##############

# Create your tests here.

class LoginTest(TestCase):
    def test_invalid_email(self):
        response= self.client.post('/api/login',{"email":"email@invalid.com", "password":"123456"}, content_type="application/json")
        self.assertEqual(response.status_code, 401)
        self.assertDictEqual(json.loads(response.content), {'error': 'Invalid email or password'})

    def test_incorrect_password(self):
        response= self.client.post('/api/login',{"email":"abc@test.com", "password":"wrongpassword"}, content_type="application/json")
        self.assertEqual(response.status_code, 401)
        self.assertDictEqual(json.loads(response.content), {'error': 'Invalid email or password'})

    def test_correct_login(self):
        response= self.client.post('/api/login',{"email":"abc@test.com", "password":"12345"}, content_type="application/json")
        self.assertEqual(response.status_code, 200)

class GetAddressesTest(TestCase):
    def setUp(self) -> None:
        self.client = Client()
        
        correct_token = jwt.encode({
            "id":"6470e1ea1fabe048dc93558d",
            "email": "customer@plain.com"
        }, key="cs308")

        invalid_token = jwt.encode({
            "id":"64327fe47efbc05cf8af42a5",
            "email": "abc@test.com"
        }, key="cs308")

        self.correct_config = f"Bearer {correct_token}"
        self.invalid_config = f"Bearer {invalid_token}"


    def test_no_token(self):
        response = self.client.get("/api/addresses_all")
        self.assertEqual(response.status_code, 401)
        self.assertDictEqual(json.loads(response.content), {'error': 'No authorization'})
    
    def test_invalid_token(self):
        response = self.client.get("/api/addresses_all", HTTP_AUTHORIZATION=self.invalid_config)
        self.assertEqual(response.status_code, 400)
        self.assertDictEqual(json.loads(response.content), {'error': 'Token does not match any user'})

    def test_correct_request(self):
        response = self.client.get("/api/addresses_all", HTTP_AUTHORIZATION=self.correct_config)
        self.assertEqual(response.status_code, 200)

class SignupTest(TestCase):

    def tearDown(self) -> None:
        connect_collection("customers").delete_one({"name":"exampleName"})

    def test_no_name(self):
        response= self.client.post('/api/signup',
                                   {"name": "", "surname": "exampleSurname" ,
                                    "email":"email@example.com", "password":"12345678",
                                    "tax_id": "111111"}, content_type="application/json")
        self.assertEqual(response.status_code, 400)
        self.assertDictEqual(json.loads(response.content), {'error': 'Name cannot be empty'})

    def test_no_surname(self):
        response= self.client.post('/api/signup',
                                   {"name": "exampleName", "surname": "" ,
                                    "email":"email@example.com", "password":"12345678",
                                    "tax_id": "111111"}, content_type="application/json")
        self.assertEqual(response.status_code, 400)
        self.assertDictEqual(json.loads(response.content), {'error': 'Surname cannot be empty'})

    def test_no_email(self):
        response= self.client.post('/api/signup',
                                   {"name": "exampleName", "surname": "exampleSurname" ,
                                    "email":"", "password":"12345678",
                                    "tax_id": "111111"}, content_type="application/json")
        self.assertEqual(response.status_code, 400)
        self.assertDictEqual(json.loads(response.content), {'error': 'Email cannot be empty'})

    def test_no_tax_id(self):
        response= self.client.post('/api/signup',
                                   {"name": "exampleName", "surname": "exampleSurname" ,
                                    "email":"email@example.com", "password":"12345678",
                                    "tax_id": ""}, content_type="application/json")
        self.assertEqual(response.status_code, 400)
        self.assertDictEqual(json.loads(response.content), {'error': 'Tax ID cannot be empty'})

    def test_no_password(self):
        response= self.client.post('/api/signup',
                                   {"name": "exampleName", "surname": "exampleSurname" ,
                                    "email":"email@example.com", "password":"",
                                    "tax_id": "111111"}, content_type="application/json")
        self.assertEqual(response.status_code, 400)
        self.assertDictEqual(json.loads(response.content), {'error': 'Password cannot be empty'})

    def test_successfull_signup(self):
        response= self.client.post('/api/signup',
                                   {"name": "exampleName", "surname": "exampleSurname" ,
                                    "email":"email@example.com", "password":"12345",
                                    "tax_id": "111111"}, content_type="application/json")
        self.assertEqual(response.status_code, 200)


class get_OrdersTest(TestCase):
    def test_no_auth(self):
        response = self.client.get('/api/get_orders')
        self.assertEqual(response.status_code, 401)
        self.assertDictEqual(json.loads(response.content), {'error': 'No token'})


    
class rateTest(TestCase):
    def test_decode(self):
        response = self.client.post("/api/rate")
        self.assertEqual(response.status_code, 401)
        self.assertDictEqual(json.loads(response.content), {"error":"Decode error"})

    def test_value(self):
        response = self.client.post("/api/rate",{
            "id" : "x",
            "newValue" : "-1",
            "order_id" : "y"
        }, content_type="application/json")
        self.assertEqual(response.status_code, 401)
        self.assertDictEqual(json.loads(response.content), {"error":"Incorrect value error"})

class commentTest(TestCase):
    def test_no_auth(self):
        response = self.client.post('/api/comment')
        self.assertEqual(response.status_code, 401)
        self.assertDictEqual(json.loads(response.content), {'error': 'No token'})

    def test_decode(self):
        correct_token = jwt.encode({
            "id":"64327fe47efbc05cf8efb3d8",
            "email": "abc@test.com"
        }, key="cs308")
        self.correct_config = f"Bearer {correct_token}"
        response = self.client.post("/api/comment", HTTP_AUTHORIZATION=self.correct_config)
        self.assertEqual(response.status_code, 401)
        
        self.assertDictEqual(json.loads(response.content), {"error":"Decode error"})
    
    def test_successfull_get_comments(self):
        response = self.client.post("/api/getComments/645388838e59825ff251838b") # existing valid product id
        self.assertEqual(response.status_code, 200)

    def test_successfull_get_user_type(self):
        token_of_manager = jwt.encode({
            "id":"643078678f83a815cbbab7c7",
            "email": "fa@fa.co"
        }, key="cs308")
        self.correct_config = f"Bearer {token_of_manager}"
        response = self.client.post("/api/getUserType", HTTP_AUTHORIZATION=self.correct_config)
        self.assertEqual(response.status_code, 200)


class GetProductsTest(TestCase):
    def test_get_products(self):
        response = self.client.get('/api/getProducts?category=all')
        self.assertEqual(response.status_code, 200)

class ProductDetailTest(TestCase):
    def test_product_detail(self):
        product_id = ObjectId("643d24c950b08234e9cb7756")

        response = self.client.get(f'/api/products/${product_id}/')
        self.assertEqual(response.status_code, 200)

    def test_wrong_product_detail(self):
        wrong_id = "611124r955b08234e9cb70599"
        response = self.client.get(f'/api/products/${wrong_id}/')
        self.assertEqual(response.status_code, 404)


class AddToCartTest(TestCase):
    def test_no_token(self):
        response = self.client.post('/api/addToCart', {"productId": "611124r955b08234e9cb70599"})
        self.assertEqual(response.status_code, 401)
        self.assertDictEqual(json.loads(response.content), {'error': 'No authorization'})

    def test_add_to_cart(self):
        test_token = jwt.encode({
            "id":"6470e1ea1fabe048dc93558d",
            "email": "customer@plain.com"
        }, key="cs308")
        
        product_id = "643d24c950b08234e9cb7756"
        response = self.client.post('/api/addToCart', {"productId": product_id}, content_type="application/json", HTTP_AUTHORIZATION=f"Bearer {test_token}")

        self.assertEqual(response.status_code, 200)

class ProductDetailTest(TestCase):

    def test_valid_product_id(self):
        valid_product_id = "64399eb776c5fba851637d64"  # Use an existing valid product _id from the database

        url = reverse("productDetail", args=[valid_product_id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
      

    def test_invalid_product_id(self):
        response = self.client.get(f"/api/products/{ObjectId()}")
        self.assertEqual(response.status_code, 404)

class DeclineCommentTest(TestCase):
    def test_decline_comment_success(self):
        # Set up test data
        customers = connect_collection("customers")
        customer = customers.find_one({"type": "product"})
        comments = connect_collection("comments")
        comment = {
            "comment": "This is a test comment",
             "product_id": ObjectId("643d24c950b08234e9cb7756"), #airpods
            "customer_id": ObjectId("643078678f83a815cbbab7c7"), #fafa
          
            "date": datetime.datetime.now(),
            "status": "pending"
        }
        comment_id = str(comments.insert_one(comment).inserted_id)
        token = encode({"id": str(customer["_id"])}, key="cs308", algorithm="HS256")
        client = Client()

        # Make request to endpoint
        response = client.post(reverse("declineComment"), data=json.dumps({"comment_id": comment_id}), content_type="application/json", HTTP_AUTHORIZATION=f"Bearer {token}")

        # Assert response status code and message
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content, b"")
        
        # Clean up test data
        comments.delete_one({"_id": ObjectId(comment_id)})

class AddAddressTest(TestCase):
    def setUp(self) -> None:
        token = jwt.encode({
            "id":"643d126ac914087e48ebe9db",
            "email": "deneme@deneme.com"
        }, key="cs308")
        self.config = f"Bearer {token}"
        self.address = {
            "name":"Test",
            "detail":"Adres",
            "phoneNumber":"123"
        }

    def test_no_data(self):
        response = self.client.post("/api/address", HTTP_AUTHORIZATION=self.config)
        self.assertEqual(response.status_code, 400)

    def test_no_auth(self):
        response = self.client.post("/api/address", self.address, content_type="application/json")
        self.assertEqual(response.status_code, 401)

    def test_correct_req(self):
        response = self.client.post("/api/address", self.address, content_type="application/json", HTTP_AUTHORIZATION=self.config)
        self.assertEqual(response.status_code, 200)

        data = json.loads(response.content)
        self.assertDictContainsSubset(self.address, data)


############## End Of First Demo Test Cases ##############


############## Start Of Final Demo Test Cases ##############

class GetProfitTest(TestCase):
    def setUp(self) -> None:
        self.client = Client()
        
        sales_token = jwt.encode({
            "id":"6470bde4cb6f7a8b3b8cfb7e",
            "email": "sales@manager.com"
        }, key="cs308")

        product_token = jwt.encode({
            "id":"6470be03cb6f7a8b3b8cfb80",
            "email": "product@manager.com"
        }, key="cs308")

        customer_token = jwt.encode({
            "id":"6470e1ea1fabe048dc93558d",
            "email": "customer@plain.com"
        }, key="cs308")

        self.sales_config = f"Bearer {sales_token}"
        self.product_config = f"Bearer {product_token}"
        self.customer_config = f"Bearer {customer_token}"

    def test_product_manager_getprofit(self):
        response = self.client.get("http://localhost:8000/api/getProfit/2023-05-01/2023-05-10", HTTP_AUTHORIZATION=self.product_config)
        self.assertEqual(response.status_code, 401)
        self.assertDictEqual(json.loads(response.content), {'error': 'Not authorized to see profit'})
    
    def test_customer_getprofit(self):
        response = self.client.get("http://localhost:8000/api/getProfit/2023-05-01/2023-05-10", HTTP_AUTHORIZATION=self.customer_config)
        self.assertEqual(response.status_code, 401)
        self.assertDictEqual(json.loads(response.content), {'error': 'Not authorized to see profit'})
    
    def test_sales_manager_getprofit(self):
        response = self.client.get("http://localhost:8000/api/getProfit/2023-05-01/2023-05-10", HTTP_AUTHORIZATION=self.sales_config)
        self.assertEqual(response.status_code, 200)

class GetApprovalCommentsTest(TestCase):
    def setUp(self) -> None:
        self.client = Client()
        
        sales_token = jwt.encode({
            "id":"6470bde4cb6f7a8b3b8cfb7e",
            "email": "sales@manager.com"
        }, key="cs308")

        product_token = jwt.encode({
            "id":"6470be03cb6f7a8b3b8cfb80",
            "email": "product@manager.com"
        }, key="cs308")

        customer_token = jwt.encode({
            "id":"6470e1ea1fabe048dc93558d",
            "email": "customer@plain.com"
        }, key="cs308")

        self.sales_config = f"Bearer {sales_token}"
        self.product_config = f"Bearer {product_token}"
        self.customer_config = f"Bearer {customer_token}"

    def test_product_manager_getapprovalcomments(self):
        response = self.client.get("http://localhost:8000/api/getApprovalComments", HTTP_AUTHORIZATION=self.product_config)
        self.assertEqual(response.status_code, 200)
    
    def test_customer_getapprovalcomments(self):
        response = self.client.get("http://localhost:8000/api/getApprovalComments", HTTP_AUTHORIZATION=self.customer_config)
        self.assertEqual(response.status_code, 401)
        self.assertDictEqual(json.loads(response.content), {'error': 'Not authorized to get pending comments'})
    
    def test_sales_manager_getapprovalcomments(self):
        response = self.client.get("http://localhost:8000/api/getApprovalComments", HTTP_AUTHORIZATION=self.sales_config)
        self.assertDictEqual(json.loads(response.content), {'error': 'Not authorized to get pending comments'})
        self.assertEqual(response.status_code, 401)

class ApproveCommentAuthTest(TestCase):
    def setUp(self) -> None:
        self.client = Client()
        
        sales_token = jwt.encode({
            "id":"6470bde4cb6f7a8b3b8cfb7e",
            "email": "sales@manager.com"
        }, key="cs308")

        product_token = jwt.encode({
            "id":"6470be03cb6f7a8b3b8cfb80",
            "email": "product@manager.com"
        }, key="cs308")

        customer_token = jwt.encode({
            "id":"6470e1ea1fabe048dc93558d",
            "email": "customer@plain.com"
        }, key="cs308")

        self.sales_config = f"Bearer {sales_token}"
        self.product_config = f"Bearer {product_token}"
        self.customer_config = f"Bearer {customer_token}"

    def test_customer_approvecommentauth(self):
        response = self.client.post("http://localhost:8000/api/approveComment", HTTP_AUTHORIZATION=self.customer_config)
        self.assertEqual(response.status_code, 401)
        self.assertDictEqual(json.loads(response.content), {'error': 'Not authorized to approve comment'})
    
    def test_sales_manager_approvecommentauth(self):
        response = self.client.post("http://localhost:8000/api/approveComment", HTTP_AUTHORIZATION=self.sales_config)
        self.assertDictEqual(json.loads(response.content), {'error': 'Not authorized to approve comment'})
        self.assertEqual(response.status_code, 401)

class DeclineCommentAuthTest(TestCase):
    def setUp(self) -> None:
        self.client = Client()
        
        sales_token = jwt.encode({
            "id":"6470bde4cb6f7a8b3b8cfb7e",
            "email": "sales@manager.com"
        }, key="cs308")

        product_token = jwt.encode({
            "id":"6470be03cb6f7a8b3b8cfb80",
            "email": "product@manager.com"
        }, key="cs308")

        customer_token = jwt.encode({
            "id":"6470e1ea1fabe048dc93558d",
            "email": "customer@plain.com"
        }, key="cs308")

        self.sales_config = f"Bearer {sales_token}"
        self.product_config = f"Bearer {product_token}"
        self.customer_config = f"Bearer {customer_token}"

    def test_customer_declinecommentauth(self):
        response = self.client.post("http://localhost:8000/api/declineComment", HTTP_AUTHORIZATION=self.customer_config)
        self.assertEqual(response.status_code, 401)
        self.assertDictEqual(json.loads(response.content), {'error': 'Not authorized to decline comment'})
    
    def test_sales_manager_declinecommentauth(self):
        response = self.client.post("http://localhost:8000/api/declineComment", HTTP_AUTHORIZATION=self.sales_config)
        self.assertDictEqual(json.loads(response.content), {'error': 'Not authorized to decline comment'})
        self.assertEqual(response.status_code, 401)

class UpdateProductTest(TestCase):
    def setUp(self) -> None:
        
        
        products = connect_collection("products")
        products.insert_one({"name":"test"})

        self.pid = products.find_one({"name":"test"})["_id"]
        self.pid = str(self.pid)

        self.obj = {
            "id":self.pid,
            "name":"test",
            "description":"description",
            "brand": "brand",
            "distributer":"distributer",
            "warranty":"warranty",
            "image": "image"
        }
        self.missing_field = {"model":"model"}
    
    def tearDown(self) -> None:
        connect_collection("products").delete_one({"name":"test"})
    def test_fails_if_missing_field(self):
        response = self.client.put("http://localhost:8000/api/product", self.obj, content_type="application/json")
        self.assertEqual(response.status_code, 400)

    def test_correctly_updates(self):
        test_obj = dict(self.missing_field, **self.obj)
        response = self.client.put("http://localhost:8000/api/product", test_obj, content_type="application/json")
        self.assertEqual(response.status_code, 200)

class AddProductTest(TestCase):
    def setUp(self) -> None:
        self.obj =  {
            "name":"addTest",
            "description":"description",
            "brand": "brand",
            "distributer":"distributer",
            "warranty":"warranty",
            "image": "image",
            "category": "64785287744cba18ce74ed67",
            "price": 15000,
            "cost": 7500,
        }

    def tearDown(self) -> None:
        connect_collection("products").delete_one({"name":"addTest"})

    def test_correctly_adds(self):
        response = self.client.post("http://localhost:8000/api/product", self.obj, content_type="application/json")
        self.assertEqual(response.status_code, 201)
        
class DeleteProductTest(TestCase):
    def setUp(self) -> None:
        self.obj =  {
            "name":"deleteTest",
            "description":"description",
            "brand": "brand",
            "distributer":"distributer",
            "warranty":"warranty",
            "image": "image",
            "category": "64785287744cba18ce74ed67",
            "price": 15000,
            "cost": 7500,
        }

        products = connect_collection("products")
        products.insert_one(self.obj)

        self.pid = products.find_one({"name":"deleteTest"})["_id"]
        self.pid = str(self.pid)

    def tearDown(self) -> None:
        connect_collection("products").delete_one({"name":"deleteTest"})

    def test_fails_if_no_id(self):
        response = self.client.delete("http://localhost:8000/api/product")
        self.assertEqual(response.status_code, 400)

    def test_correctly_deletes(self):
        response = self.client.delete(f"http://localhost:8000/api/product?id={self.pid}")
        self.assertEqual(response.status_code, 204)

class DeleteOrderTest(TestCase):
    def test_delete_nonexist(self):
        response = self.client.post("http://localhost:8000/api/deleteOrder", json.dumps({"order_id":"6486dbef16b9a542983b0b19"}), content_type="application/json")
        self.assertEqual(response.status_code, 401)

class getAllOrdersTest(TestCase):
    def test_get_all(self):
        response = self.client.get("http://localhost:8000/api/getAllOrders")
        self.assertEqual(response.status_code, 200)

class getRefundsTest(TestCase):
    def test_get_all(self):
        response = self.client.get("http://localhost:8000/api/getRefunds")
        self.assertEqual(response.status_code, 200)

class getWishlistTest(TestCase):
    def setUp(self) -> None:
        self.client = Client()

        customer_token = jwt.encode({
            "id":"6470e1ea1fabe048dc93558d",
            "email": "customer@plain.com"
        }, key="cs308")

        self.customer_config = f"Bearer {customer_token}"

    def test_get_all(self):
        response = self.client.get("http://localhost:8000/api/getWishlist")
        self.assertEqual(response.status_code, 401)

    def test_getwishlist_success(self):
        response = self.client.post("http://localhost:8000/api/getWishlist",  HTTP_AUTHORIZATION=self.customer_config)
        self.assertEqual(response.status_code, 200)

class changeRefundStaTest(TestCase):
    def test_value(self):
        response = self.client.post("http://localhost:8000/api/changeRefundSta", json.dumps({"order_id":"6486dbef16b9a542983b0b19", "ref":"x", "id":"y"}), content_type="application/json")
        self.assertEqual(response.status_code, 401)

    def test_change_nonexist(self):
        response = self.client.post("http://localhost:8000/api/changeRefundSta", json.dumps({"order_id":"z", "ref":"Accepted", "id":"y"}), content_type="application/json")
        self.assertEqual(response.status_code, 402)



class MoreProfileInfoTest(TestCase):
    def setUp(self) -> None:
        self.client = Client()
        self.customer_token = jwt.encode({
            "id": "6470be34cb6f7a8b3b8cfb82",
            "email": "fail@plain.com"
        }, key="cs308")
        self.config = f"Bearer {self.customer_token}"

    def test_more_profile_info_fail(self):
        headers = {'Authorization': self.config}
        response = self.client.get("http://localhost:8000/api/moreProfileInfo", **headers)
        self.assertEqual(response.status_code, 401)
       
class GetAddressesInfoTest(TestCase):
    def setUp(self) -> None:
        self.client = Client()
        self.customer_token = jwt.encode({
            "id": "6470be34cb6f7a8b3b8cfb82",
            "email": "fail@plain.com"
        }, key="cs308")
        self.config = f"Bearer {self.customer_token}"

    def test_get_profile_info_fail(self):
        headers = {'Authorization': self.config}
        response = self.client.get("http://localhost:8000/api/getProfileInfo", **headers)
        self.assertEqual(response.status_code, 401)


class InvoiceTest(TestCase):
    def setUp(self) -> None:
        self.client = Client()

    def test_invoice_get_success(self):
        response = self.client.get("http://localhost:8000/api/invoice")
        self.assertEqual(response.status_code, 200)

class AddCategoryTest(TestCase):
    def setUp(self) -> None:
        self.obj =  {
            "name":"testAddCategory",
        }

    def tearDown(self) -> None:
        connect_collection("categories").delete_one({"name":"testAddCategory"})

    def successfull_cat_adding(self):
        response = self.client.post("http://localhost:8000/api/category", self.obj, content_type="application/json")
        self.assertEqual(response.status_code, 201)

class DeleteCategoryTest(TestCase):
    def setUp(self) -> None:
        self.obj =  {
            "name":"testDeleteCategory",
        }

        categories = connect_collection("categories")
        categories.insert_one(self.obj)

        self.pid = categories.find_one({"name":"testDeleteCategory"})["_id"]
        self.pid = str(self.pid)

    def tearDown(self) -> None:
        connect_collection("categories").delete_one({"name":"testDeleteCategory"})

    def test_fails_if_no_id(self):
        response = self.client.delete("http://localhost:8000/api/category")
        self.assertEqual(response.status_code, 400)

    def test_correctly_deletes(self):
        response = self.client.delete(f"http://localhost:8000/api/category?id={self.pid}")
        self.assertEqual(response.status_code, 204)

############## End Of Final Demo Test Cases ##############