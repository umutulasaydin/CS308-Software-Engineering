from bson import ObjectId
from bson import json_util
from django.http import  HttpRequest, HttpResponse
import json
from utils import connect_collection, create_customer, create_product, populate_order, create_comment
import bcrypt
import jwt
import datetime
from django.core.mail import EmailMessage
from django.core import mail
import base64
# Create your views here.

def login(request: HttpRequest):
    # get email and password from request body
    body = json.loads(request.body.decode())
    email = body["email"]
    password = body ["password"]

    # get user from database
    customers = connect_collection("customers")
    customer: dict = customers.find_one({"email": email})

    # if no user exists with the given email or password is incorrect
    if customer is None:
        return HttpResponse(json.dumps({'error': 'Invalid email or password'}), content_type="application/json", status=401)
    # check if passwords match

    password_correct = bcrypt.checkpw(bytes(password, "utf-8"), customer["password"])
    
    if not password_correct:
        return HttpResponse(json.dumps({'error': 'Invalid email or password'}), content_type="application/json", status=401)
    
    # login is ok, create token and return
    token = jwt.encode({
        "id": str(customer["_id"]),
        "email": customer["email"]}, key="cs308")
    return HttpResponse(token, status=200)

def signup(request: HttpRequest):

    body = json.loads(request.body.decode())
    name = body["name"]
    surname = body["surname"]
    email = body["email"]
    tax_id = body["tax_id"]
    password = body["password"]

    if not name:
        return HttpResponse(json.dumps({'error': 'Name cannot be empty'}), content_type="application/json", status=400)
    if not surname:
        return HttpResponse(json.dumps({'error': 'Surname cannot be empty'}), content_type="application/json", status=400)
    if not email:
        return HttpResponse(json.dumps({'error': 'Email cannot be empty'}), content_type="application/json", status=400)
    if not tax_id:
        return HttpResponse(json.dumps({'error': 'Tax ID cannot be empty'}), content_type="application/json", status=400)
    if not password:
        return HttpResponse(json.dumps({'error': 'Password cannot be empty'}), content_type="application/json", status=400)

       

    salt = bcrypt.gensalt()
    hashed_pwd = bcrypt.hashpw(bytes(password,"utf-8"), salt)

    created = create_customer(
            collection="customers",
            name= name,
            surname=surname,
            email=email,
            tax_id=tax_id,
            password=hashed_pwd
        )
    
    if (created):
        return(HttpResponse("Success", status=200))
    else:
        print("error signup")
        return(HttpResponse("Couldn't signup", status=400))
    
def getAddressesOfUser(request: HttpRequest):
    try:
        token = request.headers["Authorization"][7:]
        token_dec = jwt.decode(token, key="cs308", algorithms=["HS256"])
    except:
        return HttpResponse(json.dumps({'error': 'No authorization'}),status=401)

    customers = connect_collection("customers")
    customer = customers.find_one({"_id": ObjectId(token_dec["id"])})

    if customer is None:
        return HttpResponse(json.dumps({'error': 'Token does not match any user'}), content_type="application/json", status=400)
    
    address_ids = customer["address"]
    addresses = connect_collection("addresses")
    address_arr = []
    for id in address_ids:
        addr = addresses.find_one( {"_id": id})
        addr["id"] = str(addr["_id"])
        del addr["_id"]
        address_arr.append(addr)
    return HttpResponse(json.dumps(address_arr), content_type="application/json", status=200)


def get_cart_items(request: HttpRequest):
    if request.method == "GET":
        token = request.headers["Authorization"][7:]
        decoded = jwt.decode(token, key="cs308", algorithms=["HS256"])
        # get user from database
        customers = connect_collection("customers")
        customer = customers.find_one( { "_id": ObjectId(decoded["id"]) } )
        # if no user exists with given id
        if customer is None:
            return HttpResponse(json.dumps({'error': 'Invalid email or password'}), content_type="application/json", status=401)

        cart = customer["cart"]

    elif request.method == "POST":
        body = json.loads(request.body.decode())
        cart = body["cart"]
        
    products = connect_collection("products")
    productArr = []
    for item in cart:
        product = products.find_one( { "_id": item["item"] } )
        product["id"] = str(product["_id"])
        product["qty"] = item["qty"]
        del product["wishlist_ids"]
        del product["_id"]
        del product["category"]
        productArr.append(product)

    return(HttpResponse( json.dumps(productArr), content_type="application/json", status=200))

def removeFromCart(request: HttpRequest):
    token = request.headers["Authorization"][7:]
    decoded = jwt.decode(token, key="cs308", algorithms=["HS256"])
    body = json.loads(request.body.decode())
    del_product = body["product_id"]
    print("pid:",del_product, "\n", "uid:",decoded["id"])
    customers = connect_collection("customers")
    customer = customers.find_one( { "_id": ObjectId(decoded["id"]) } )

    if customer is None:
        return HttpResponse(json.dumps({'error': 'Invalid email or password'}), content_type="application/json", status=401)
    
    customers.update_one(
        { "_id": ObjectId(decoded["id"]) },
        { "$pull": { "cart": {"item": ObjectId(del_product)}} },
    )


    return(HttpResponse(status=200))
    

def order(request: HttpRequest):
    
    
    body = json.loads(request.body.decode())
    token = jwt.decode(request.headers["Authorization"][7:], key="cs308", algorithms=["HS256"])

    # Convert id strings to ObjectId
    body["customer"] = ObjectId(token["id"])
    body["address"] = ObjectId(body["address"])

    for i, id in enumerate(body["products"]):
        body["products"][i]["itemId"] = ObjectId(id["itemId"])
        body["products"][i]["commented"] = False
        body["products"][i]["rated"] = False
        body["products"][i]["refund"] = "None"
    
    #Add order status and order no
    body["delivery_status"] = "Processing"

    current_order_count = connect_collection("utils").find_one({"name": "order-count"})["count"]
    next_count = str(int(current_order_count) + 1)
    next_count = "0" * (7 - len(next_count)) + next_count
    body["orderNo"] = next_count

    orders = connect_collection("orders")
    res = orders.insert_one(body)

    ret = orders.find_one({"_id": res.inserted_id })
    ret = populate_order(ret)

    connect_collection("utils").update_one({"name": "order-count"}, {"$set": {"count": next_count}})
    connect_collection("customers").update_one({"_id": ObjectId(token["id"])}, {"$set": {"cart": []}})
    return HttpResponse(json.dumps(ret), content_type="application/json", status=200)


def getProducts(request: HttpRequest):
    products = connect_collection("products")
    categories = connect_collection("categories")
    category = request.GET.get('category', None)
    

    if category is None:
        return HttpResponse(json.dumps({"error": "No category specified"}), status=400)
    
    if category == "all":
        productArr = []
        for product in products.find():
            product["id"] = str(product["_id"])
            cat = categories.find_one({"_id": product["category"]})
            del product["category"]
            product["category"] = cat["name"]
            del product["wishlist_ids"]
            del product["_id"]
            productArr.append(product)
        return HttpResponse(json.dumps(productArr), content_type="application/json", status=200)
    
    productArr = []
    cat = categories.find_one({"name": category})

    for product in products.find({"category": cat["_id"]}):
        product["id"] = str(product["_id"])
        del product["category"]
        del product["wishlist_ids"]
        product["category"] = category
        del product["_id"]
        productArr.append(product)
    return HttpResponse(json.dumps(productArr), content_type="application/json", status=200)

def productDetail(request: HttpRequest, _id):
    products = connect_collection("products")

    print(f"Requested product ID: {_id}")
    
    product = products.find_one({"_id": ObjectId(_id)})

    if product is None:
        return HttpResponse(status=404)

    product["id"] = str(product["_id"])
    del product["_id"]

    return HttpResponse(json_util.dumps(product), content_type="application/json", status=200)

def register_invoice(request: HttpRequest):
    body = json.loads(request.body.decode())
    id = body["order"]
    pdf = base64.b64decode(body["pdfB64"][28:])

    with mail.get_connection() as connection:
        email = EmailMessage(
            "Invoice of your order",
            "",
            "noreply@pear.com",
            [body["email"]],
            connection=connection
        )
        email.attach("invoice.pdf", pdf, "application/pdf")
        email.send()

    connect_collection("orders").update_one({"_id": ObjectId(id)}, {"$set": {"pdf": pdf}})
    return HttpResponse("success", status=200) 

def addComment(request: HttpRequest):
    token = request.headers["Authorization"][7:]
    decoded = jwt.decode(token, key="cs308", algorithms=["HS256"])
    body = json.loads(request.body.decode())
    comment = body["comment"]
    prod_id = body["prod_id"]

    customers = connect_collection("customers")
    customer = customers.find_one( { "_id": ObjectId(decoded["id"]) } )

    products = connect_collection("products")
    product = products.find_one( { "_id": ObjectId(prod_id) } )

    if customer is None:
        return HttpResponse(json.dumps({'error': 'Invalid email or password'}), content_type="application/json", status=401)
    
    if product is None:
        return HttpResponse(json.dumps({'error': 'Product not found'}), content_type="application/json", status=404)
    
    create_comment("comments", comment=comment, product_id=ObjectId(prod_id), customer_id=ObjectId(customer["_id"]) )
    return HttpResponse("success", status=200)
    

def getComments(request: HttpRequest, _id):
    #product_id = request.GET.get("id", "None")
    product_id = _id
    print("id:",product_id)
    comments = connect_collection("comments")

    
    commentArr = []
    for comment in comments.find({"product_id": ObjectId(product_id) }):
        comment["_id"] = str(comment["_id"])
        comment["product_id"] = str(comment["product_id"])
        comment["customer_id"] = str(comment["customer_id"])
        comment["date"] = dateToString( comment["date"] )
        commentArr.append(comment)
    
    
    return HttpResponse(json.dumps(commentArr), content_type="application/json", status=200)

def dateToString(date: datetime):
    year = date.year
    month = date.month
    day = date.day
    hour = date.hour
    minute = date.minute
    myStr = f"{day}/{month}/{year} {hour}:{minute}"
    return myStr

def changeAmount(request: HttpRequest):
    body = json.loads(request.body.decode())
    prod_id = body["product_id"]
    new_qty = body["qty"]
    token = request.headers["Authorization"][7:]
    decoded = jwt.decode(token, key="cs308", algorithms=["HS256"])
    # get user from database
    customers = connect_collection("customers")
    customer = customers.find_one( { "_id": ObjectId(decoded["id"]) } )
    # if no user exists with given id
    if customer is None:
        return HttpResponse(json.dumps({'error': 'Invalid email or password'}), content_type="application/json", status=401)

    customers.update_one( 
        {"$and": [{ "_id": ObjectId(decoded["id"]) }, { "cart": { "$elemMatch": {"item": ObjectId(prod_id)}}} ]},
        { "$set": {"cart.$.qty": new_qty}}
    )

    cart = customer["cart"]
    products = connect_collection("products")
    productArr = []
    for item in cart:
        product = products.find_one( { "_id": ObjectId(item["item"]) } )
        product["item"] = str(product["_id"])
        product["qty"] = item["qty"]
        del product["_id"]
        del product["category"]
        del product["wishlist_ids"]
        productArr.append(product)

    return(HttpResponse( json.dumps(productArr), content_type="application/json", status=200))

def getUserType(request: HttpRequest):
    token = request.headers["Authorization"][7:]
    token_dec = jwt.decode(token, key="cs308", algorithms=["HS256"])

    customers = connect_collection("customers")
    customer = customers.find_one({"_id": ObjectId(token_dec["id"])})

    if customer is None:
        return HttpResponse(json.dumps({'error': 'Invalid email or password'}), content_type="application/json", status=401)
    
    userType = customer["type"]
    return(HttpResponse(userType, content_type="application/json", status=200))

def approveComment(request: HttpRequest):
    token = request.headers["Authorization"][7:]
    token_dec = jwt.decode(token, key="cs308", algorithms=["HS256"])

    customers = connect_collection("customers")
    customer = customers.find_one({"_id": ObjectId(token_dec["id"])})

    if customer is None:
        return HttpResponse(json.dumps({'error': 'Invalid email or password'}), content_type="application/json", status=401)
    
    userType = customer["type"]
    if userType != "product":
        return HttpResponse(json.dumps({'error': 'Not authorized to approve comment'}), content_type="application/json", status=401)
    
    body = json.loads(request.body.decode())
    comment_id = body["comment_id"]
    comments = connect_collection("comments")
    comments.update_one(
        { "_id": ObjectId(comment_id) },
        { "$set": {"status": "true"} }
    )

    return(HttpResponse(status=200))


def declineComment(request: HttpRequest):
    token = request.headers["Authorization"][7:]
    token_dec = jwt.decode(token, key="cs308", algorithms=["HS256"])

    customers = connect_collection("customers")
    customer = customers.find_one({"_id": ObjectId(token_dec["id"])})

    if customer is None:
        return HttpResponse(json.dumps({'error': 'Invalid email or password'}), content_type="application/json", status=401)
    
    userType = customer["type"]
    if userType != "product":
        return HttpResponse(json.dumps({'error': 'Not authorized to decline comment'}), content_type="application/json", status=401)
    
    body = json.loads(request.body.decode())
    comment_id = body["comment_id"]
    comments = connect_collection("comments")
    comments.delete_one({"_id": ObjectId(comment_id)})
    return(HttpResponse(status=200))


def get_orders(request: HttpRequest):
    try:
        token = request.headers["Authorization"][7:]
        token_dec = jwt.decode(token, key="cs308", algorithms=["HS256"])
    except:
        return HttpResponse(json.dumps({'error': 'No token'}), status=401)
    

    value = connect_collection("orders").find({"customer": ObjectId(token_dec["id"])})
    address_db = connect_collection("addresses")
    product_db = connect_collection("products")
    send = []
    try:
        for i in value:
            
            products = []
            for j in i["products"]:
                
                product_object = product_db.find_one({"_id":j["itemId"]})
               
                products.append(
                    [
                        j["price"],
                        j["qty"],
                        j["commented"],
                        j["rated"],
                        j["refund"],
                        product_object["name"],
                        product_object["image"],
                        str(j["itemId"])
                    ]
                )
            address = address_db.find_one({"_id":i["address"]})
            send.append([
                i["orderNo"],
                products,
                address["detail"],
                i["date"],
                i["price"],
                i["delivery_status"],
                address["phoneNumber"],
                str(i["_id"])
            ])
    except:
        pass
    return HttpResponse(json.dumps({0:send}), status=200)

def rate(request: HttpRequest):
    try:
        body = json.loads(request.body.decode())
    except:
        return HttpResponse(json.dumps({"error":"Decode error"}), status = 401)
    product_id = body["id"]
    value = float(body["newValue"])
    if (value < 0 or value > 5):
        return HttpResponse(json.dumps({"error":"Incorrect value error"}), status = 401)

    order_id = body["order_id"]


   
    product = connect_collection("products").find_one({"_id": ObjectId(product_id)})

    rating = product["rating"]
    rating[1] = (rating[0]*rating[1] + value) / (rating[0]+1)
    rating[0] += 1
    connect_collection("products").update_one({"_id": ObjectId(product_id)}, {"$set": {"rating":rating}})

    
    order = connect_collection("orders").find_one({"_id":ObjectId(order_id)})
    
    products = order["products"]


    for i in products:
        if i["itemId"] == ObjectId(product_id):
            i["rated"] = True
    
    connect_collection("orders").update_one({"_id": ObjectId(order_id)}, {"$set": {"products": products}})
    
    return HttpResponse("succes", status = 200)


def comment(request: HttpRequest):
    try:
        token = request.headers["Authorization"][7:]
        token_dec = jwt.decode(token, key="cs308", algorithms=["HS256"])
    except:
        return HttpResponse(json.dumps({'error': 'No token'}), content_type="application/json", status=401)
    try:
        body = json.loads(request.body.decode())
    except:
        return HttpResponse(json.dumps({"error":"Decode error"}), status = 401)
    product_id = body["id"]
    value = body["value2"]
    date = body["date"]
  
    element = {
        "comment":value,
        "product_id": ObjectId(product_id),
        "customer_id": ObjectId(token_dec["id"]),
        "date" : datetime.datetime.now(),
        "status" : "pending"
    }
    
    connect_collection("comments").insert_one(element)
    order_id = body["order_id"]

    order = connect_collection("orders").find_one({"_id":ObjectId(order_id)})
    products = order["products"]

    for i in products:
        if i["itemId"] == ObjectId(product_id):
            i["commented"] = True
    
    connect_collection("orders").update_one({"_id": ObjectId(order_id)}, {"$set": {"products": products}})

    return HttpResponse("succes", status = 200)



def addToCart(request: HttpRequest):
    try:
        token = request.headers["Authorization"][7:]
        token_dec = jwt.decode(token, key="cs308", algorithms=["HS256"])
    except:
        return HttpResponse(json.dumps({'error': 'No authorization'}), content_type="application/json", status=401)
    
    body = json.loads(request.body.decode())
    productId = body["productId"]
    print(productId)
    #productId = request.GET.get('productId', None)

    customers = connect_collection("customers")
    customer = customers.find_one({"_id": ObjectId(token_dec["id"])})

    if customer is None:
        return HttpResponse(json.dumps({'error': 'Invalid email or password'}), content_type="application/json", status=401)

    # Check if the product is already in the cart
    product_in_cart = False
    for item in customer['cart']:
        if str(item["item"]) == productId:
            item["qty"] += 1
            product_in_cart = True
            break

    if not product_in_cart:
        new_cart_item = {"item": ObjectId(productId), "qty": 1}
        customer["cart"].append(new_cart_item)

    updated_cart = {"cart": customer["cart"]}
    customers.update_one({"_id": ObjectId(token_dec["id"])}, {"$set": updated_cart})

    return(HttpResponse(status=200))

def clearCart(request: HttpRequest):
    token = request.headers["Authorization"][7:]
    token_dec = jwt.decode(token, key="cs308", algorithms=["HS256"])

    customers = connect_collection("customers")
    customer = customers.find_one({"_id": ObjectId(token_dec["id"])})

    if customer is None:
        return HttpResponse(json.dumps({'error': 'Invalid email or password'}), content_type="application/json", status=401)
    
    customers.update_one({"_id": ObjectId(token_dec["id"])}, {"$set": {"cart": []}})
    return HttpResponse(status=200)

def mergeLocalCart(request: HttpRequest):
    body = json.loads(request.body.decode())
    localCart = body["cart"]
    token = request.headers["Authorization"][7:]
    token_dec = jwt.decode(token, key="cs308", algorithms=["HS256"])

    customers = connect_collection("customers")
    customer = customers.find_one({"_id": ObjectId(token_dec["id"])})

    if customer is None:
        return HttpResponse(json.dumps({'error': 'Invalid email or password'}), content_type="application/json", status=401)
    
    for item in localCart:
        item["item"] = ObjectId(item["item"])

    customers.update_one(
        {"_id": ObjectId(token_dec["id"])},
        {"$set": {"cart": localCart}}
    )

    return HttpResponse(status=200)

def address(request:HttpRequest):
    try:
        body = json.loads(request.body.decode())
    except:
        return HttpResponse(json.dumps({'error': 'Missing address data'}),status=400)

    try:
        token = request.headers["Authorization"][7:]
        token_dec = jwt.decode(token, key="cs308", algorithms=["HS256"])
    except:
        return HttpResponse(json.dumps({'error': 'No authorization'}),status=401)
    
    addresses = connect_collection("addresses")
    res = addresses.insert_one(body)
    adr = addresses.find_one({"_id": res.inserted_id})

    customers = connect_collection("customers")
    customer = customers.find_one({"_id": ObjectId(token_dec["id"])})
    customer["address"].append(adr["_id"])
    customers.update_one({"_id": customer["_id"]}, {"$set": {"address": customer["address"]}})

    adr["id"] = str(adr["_id"])
    del adr["_id"]
    
    
    return HttpResponse(json.dumps(adr), content_type="application/json", status=200)

def getProfit(request: HttpRequest, startDate: str, endDate: str):
    start = datetime.date.fromisoformat(startDate)
    start += datetime.timedelta(days=1)
    end = datetime.date.fromisoformat(endDate)
    end += datetime.timedelta(days=2)
    
    token = request.headers["Authorization"][7:]
    token_dec = jwt.decode(token, key="cs308", algorithms=["HS256"])

    customers = connect_collection("customers")
    customer = customers.find_one({"_id": ObjectId(token_dec["id"])})

    if customer is None:
        return HttpResponse(json.dumps({'error': 'Invalid email or password'}), content_type="application/json", status=401)
    
    userType = customer["type"]
    if userType != "sales":
        return HttpResponse(json.dumps({'error': 'Not authorized to see profit'}), content_type="application/json", status=401)
    

    queryStart = f"{start.year}-{start.month:02d}-{start.day:02d}"
    queryEnd = f"{end.year}-{end.month:02d}-{end.day:02d}"
    orders = connect_collection("orders")
    print("querystart:", queryStart, "end:", queryEnd)
    orders = orders.find({
        "date": { "$gte": queryStart, "$lt": queryEnd}
    })
    
    profitArr = []

    for order in orders:
        temp = {
                "price": order["price"] -9.99,
                "cost": order["cost"],
                "date": order["date"],
            }
        profitArr.append(temp)

    return HttpResponse(json.dumps(profitArr), status=200)
    
def changeStock(request: HttpRequest):
    body = json.loads(request.body.decode())
    product_id = body["product_id"]
    new_stock = body["new_stock"]
    token = request.headers["Authorization"][7:]
    token_dec = jwt.decode(token, key="cs308", algorithms=["HS256"])

    customers = connect_collection("customers")
    customer = customers.find_one({"_id": ObjectId(token_dec["id"])})

    products = connect_collection("products")
    product = products.find_one( { "_id": ObjectId(product_id) } )

    if product is None:
        return HttpResponse(json.dumps({'error': 'Product not found'}), content_type="application/json", status=404)
    
    if customer is None:
        return HttpResponse(json.dumps({'error': 'Invalid email or password'}), content_type="application/json", status=401)
        
    userType = customer["type"]
    if userType != "product":
        return HttpResponse(json.dumps({'error': 'Not authorized to change stock'}), content_type="application/json", status=401)

    products.update_one(
        { "_id": ObjectId(product_id) },
        { "$set": {"stock": new_stock} }
    )

    return HttpResponse("successfully changed stock", status=200)

def addWishlist(request: HttpRequest):
    try:
        token = request.headers["Authorization"][7:]
        token_dec = jwt.decode(token, key="cs308", algorithms=["HS256"])
    except:
        return HttpResponse(json.dumps({'error': 'No authorization'}), content_type="application/json", status=401)
    
    body = json.loads(request.body.decode())
    productId = body["productId"]
    print(productId)
    #productId = request.GET.get('productId', None)

    customers = connect_collection("customers")
    customer = customers.find_one({"_id": ObjectId(token_dec["id"])})

    products = connect_collection("products")
    product = products.find_one({"_id": ObjectId(productId)})

    if customer is None:
        return HttpResponse(json.dumps({'error': 'Invalid email or password'}), content_type="application/json", status=401)

   
    product_in_wishlist = False
    for item_id in customer["wishlist"]:

        if str(item_id["_id"]) == str(productId):
            customer["wishlist"].remove(item_id)
            product_in_wishlist = True
            break

    if product_in_wishlist == False:
        customer["wishlist"].append(product)
  

    updated_wishlist = {"wishlist": customer["wishlist"]}
    customers.update_one({"_id": ObjectId(token_dec["id"])}, {"$set": updated_wishlist})

    return(HttpResponse(status=200))

def addCustomertoProductWishlist(request: HttpRequest):
    try:
        token = request.headers["Authorization"][7:]
        token_dec = jwt.decode(token, key="cs308", algorithms=["HS256"])
    except:
        return HttpResponse(json.dumps({'error': 'No authorization'}), content_type="application/json", status=401)
    
    body = json.loads(request.body.decode())
    productID = body["productId"]

    products = connect_collection("products")
    product = products.find_one({"_id": ObjectId(productID)})

    customers = connect_collection("customers")
    customer = customers.find_one({"_id": ObjectId(token_dec["id"])})
    customerID = token_dec["id"]

    if customer is None:
        return HttpResponse(json.dumps({'error': 'Invalid email or password'}), content_type="application/json", status=401)

    try:

        product_in_wishlist = False
        for index, item in enumerate(product["wishlist_ids"]):
            if str(item) == str(customerID):
                product_in_wishlist = True
                del product["wishlist_ids"][index]

        if not product_in_wishlist:
            products.update_one(
                {"_id": ObjectId(productID)},
                {"$push": {"wishlist_ids": ObjectId(customerID)}}
            )
        else:
            
            products.update_one(
        {"_id": ObjectId(productID)},
        {"$pull": {"wishlist_ids": ObjectId(customerID)}}
    )
    except:
        return HttpResponse(json.dumps({'error': 'Invalid wishlist'}), content_type="application/json", status=401)

    return(HttpResponse(status=200))
    

def invoice(request: HttpRequest):
    if request.method == "GET":
        orders = connect_collection("orders").find({})
        orders = map(lambda x: {
            "orderNo": x["orderNo"],
            "date": x["date"],
            "pdf": "data:application/pdf;base64," + base64.b64encode(x["pdf"]).decode()
        }, orders)
        orders = list(orders)

        return HttpResponse(json.dumps(orders), content_type="application/json", status=200)


def getWishlist(request: HttpRequest):
    try:
        token = request.headers["Authorization"][7:]
        token_dec = jwt.decode(token, key="cs308", algorithms=["HS256"])
        print(token_dec)
    except:
        return HttpResponse(json.dumps({'error': 'No authorization'}), content_type="application/json", status=401)
    

    customers = connect_collection("customers")
    customer = customers.find_one({"_id": ObjectId(token_dec["id"])})
    products = customer["wishlist"] 

   

    if customer is None:
        return HttpResponse(json.dumps({'error': 'Invalid email or password'}), content_type="application/json", status=401)
    
    productArr = []
    for product in products:
        
        productArr.append(
            [
                product["name"],
                product["description"],
                product["model"],
                product["image"],
                str(product["_id"])
            ]
        )
    
    return HttpResponse(json.dumps(productArr), content_type="application/json", status=200)

def product(request: HttpRequest):
    if request.method == "PUT":
        body = json.loads(request.body.decode())
        
        try:
            connect_collection("products").update_one({"_id": ObjectId(body["id"])}, {"$set": {
                "name":body["name"],
                "description":body["description"],
                "brand": body["brand"],
                "distributer":body["distributer"],
                "warranty":body["warranty"],
                "model":body["model"],
                "image": body["image"]
            }})
            return HttpResponse(status=200)
        except:
            return HttpResponse(status=400)

    if request.method == "POST":
        body = json.loads(request.body.decode())
        body["category"] = ObjectId(body["category"])
        body["rating"] = [0, 0]
        body["wishlist_ids"] = []

        connect_collection("products").insert_one(body)
        return HttpResponse(status=201)
    
    if request.method == "DELETE":
        id = request.GET.get("id", None)
        
        if id is None:
            return HttpResponse(status=400)
        
        oid = ObjectId(id)

        connect_collection("products").update_one({"_id":oid}, {"$set": {"deleted": True, "wishlist_ids": []}} )

        customers = connect_collection("customers")
        customer_list = customers.find({})
        for c in customer_list:
            ids = list(map(lambda x: x["_id"] ,c["wishlist"]))
            if ids.count(oid) > 0:
                idx = ids.index(oid)
                customers.update_one({"_id": c["_id"]}, {"$set": {"wishlist": c["wishlist"][:idx] + c["wishlist"][idx + 1:]}})

        return HttpResponse(status=204)

def category(request: HttpRequest):

    if request.method == "GET":

        cats = connect_collection("categories").find({})
        cats = map(lambda x: {"id": str(x["_id"]),  "name": x["name"]}, cats)
        cats = list(cats)

        return HttpResponse(json.dumps(cats), content_type="application/json", status=200)
    
    elif request.method == "POST":

        body = json.loads(request.body.decode())
        new_category = {"name": body["name"]}
        connect_collection("categories").insert_one(new_category)
        return HttpResponse(status=201)

    elif request.method == "DELETE":

        id = request.GET.get("id", None)
        if id is None:
            return HttpResponse(status=400)
        
        oid = ObjectId(id)

        # Remove all products in the category by setting their 'deleted' property to True
        connect_collection("products").update_many({"category": oid}, {"$set": {"deleted": True, "wishlist_ids": []}})
                                                   
        customers = connect_collection("customers")
        customer_list = customers.find({})
        for c in customer_list:
            ids = list(map(lambda x: x["_id"] ,c["wishlist"]))
            if ids.count(oid) > 0:
                idx = ids.index(oid)
                customers.update_one({"_id": c["_id"]}, {"$set": {"wishlist": c["wishlist"][:idx] + c["wishlist"][idx + 1:]}})

        # Remove the category
        connect_collection("categories").delete_one({"_id": oid})

        return HttpResponse(status=204)

def convert_objectid_fields(document):
    for key in document:
        if isinstance(document[key], ObjectId):
            document[key] = str(document[key])
        elif isinstance(document[key], dict):
            convert_objectid_fields(document[key])
        elif isinstance(document[key], list):  # Check if the field's value is a list
            for i in range(len(document[key])):
                if isinstance(document[key][i], ObjectId):  # If an ObjectId is in the list, convert it
                    document[key][i] = str(document[key][i])
                elif isinstance(document[key][i], dict):  # If a dict is in the list, recursively call the function
                    convert_objectid_fields(document[key][i])
    return document

def updateProduct(request: HttpRequest, _id):
    if request.method != 'PUT':
        return HttpResponse(status=405) # Method not allowed

    # Check if product exists
    products = connect_collection("products")
    product = products.find_one({"_id": ObjectId(_id)})
    
    if product is None:
        return HttpResponse(status=404) # Product not found

    # Convert ObjectId to string
    product['_id'] = str(product['_id'])

    try:
        body = json.loads(request.body.decode())
    except json.JSONDecodeError:
        return HttpResponse(status=400) # Bad request

    update_fields = {}

    if 'price' in body:
        price = body['price']
        if not isinstance(price, (int, float)) or price < 0:
            return HttpResponse(status=401) # Price Input not in correct format
        update_fields['price'] = price

    if 'discount' in body:
        discount = body['discount']
        if not isinstance(discount, int) or not (0 <= discount <= 100):
            return HttpResponse(status=402) # Discount Input not in correct format
        update_fields['discount'] = discount

    if update_fields:
        products.update_one({"_id": ObjectId(_id)}, {"$set": update_fields})

    product = products.find_one({"_id": ObjectId(_id)})
    product = convert_objectid_fields(product) # Convert all ObjectId fields

    print(product)

    return HttpResponse(json.dumps(product), content_type="application/json", status=200)


def notifyWishlistCustomers(request: HttpRequest):
    body = json.loads(request.body.decode())
    customer_ids = body["customerIds"]
    product = body["product"]
    product = convert_objectid_fields(product) # Convert all ObjectId fields

    print(f"Received customer ids: {customer_ids}") 

    customers = connect_collection("customers").find({"_id": {"$in": [ObjectId(_id) for _id in customer_ids]}})
    discounted_price = product['price'] * (100 - int(product['discount'])) / 100

    print(f"Found customers: {list(customers)}")  # Debugging line
    customers.rewind()  # Move the cursor back to the start

    with mail.get_connection() as connection:
        for customer in customers:
            #print(customer.email)
            email = EmailMessage(
                f"{product['name']} is now on discount!",
                f"Dear {customer['name']},\n\nThe product '{product['name']}' that you've added to your wishlist is now on discount. The new price is {discounted_price} and the discount is {product['discount']}%.\n\nBest,\nPEAR.",
                "noreply@pear.com",
                [customer["email"]],
                connection=connection
            )
            email.send()

    return HttpResponse("success", status=200)


def getApprovalComments(request: HttpRequest):
    token = request.headers["Authorization"][7:]
    token_dec = jwt.decode(token, key="cs308", algorithms=["HS256"])

    customers = connect_collection("customers")
    customer = customers.find_one({"_id": ObjectId(token_dec["id"])})

    if customer is None:
        return HttpResponse(json.dumps({'error': 'Invalid email or password'}), content_type="application/json", status=401)
        
    userType = customer["type"]
    if userType != "product":
        return HttpResponse(json.dumps({'error': 'Not authorized to get pending comments'}), content_type="application/json", status=401)

    comments = connect_collection("comments")
    products = connect_collection("products")
    
    commentArr = []
    for comment in comments.find({"status": "pending" }):
        product = products.find_one( {"_id": comment["product_id"]} )
        comment["_id"] = str(comment["_id"])
        comment["product_id"] = str(comment["product_id"])
        comment["customer_id"] = str(comment["customer_id"])
        comment["date"] = dateToString( comment["date"] )
        comment["name"] = product["name"]
        comment["image"] = product["image"]
        commentArr.append(comment)
    
    return HttpResponse(json.dumps(commentArr), content_type="application/json", status=200)

def deleteOrder(request:HttpRequest):
    body = json.loads(request.body.decode())
    product = connect_collection("products")
    try:
        products = connect_collection("orders").find_one({"_id":ObjectId(body["order_id"])})["products"]
    except:
        return HttpResponse(status=401)
    try:
        for i in range(len(products)):
            stock = product.find_one({"_id": ObjectId(products[i]["itemId"])})["stock"]
            product.update_one( {"_id": ObjectId(products[i]["itemId"])}, {"$set": {"stock":stock+1}})
    except:
        pass
    connect_collection("orders").delete_one({"_id":ObjectId(body["order_id"])})
    return HttpResponse(status=200)

def getRefunds(request:HttpRequest):

    value = connect_collection("orders").find({})
    address_db = connect_collection("addresses")
    product_db = connect_collection("products")
    send = []
   
    for i in value:
        try:
            products = []
            for j in i["products"]:
                if j["refund"] != "None":
                    product_object = product_db.find_one({"_id":j["itemId"]})
                
                    products.append(
                        [
                            j["price"],
                            j["qty"],
                            j["commented"],
                            j["rated"],
                            j["refund"],
                            product_object["name"],
                            product_object["image"],
                            str(j["itemId"]),
        
                        ]
                    )
            if len(products) != 0:
                address = address_db.find_one({"_id":i["address"]})
                send.append([
                    i["orderNo"],
                    products,
                    address["detail"],
                    i["date"],
                    i["price"],
                    i["delivery_status"],
                    address["phoneNumber"],
                    str(i["_id"]),
                    str(i["customer"])
                ])
        except:
            pass
    

    return HttpResponse(json.dumps({0:send}), content_type = "application/json",  status=200)

def getAllOrders(request:HttpRequest):
    value = connect_collection("orders").find({})
    address_db = connect_collection("addresses")
    product_db = connect_collection("products")
    send = []
    
   
    for i in value:
        products = []
        try:
            for j in i["products"]:
            
                product_object = product_db.find_one({"_id":j["itemId"]})
                
                products.append(
                    [
                        j["price"],
                        j["qty"],
                        j["commented"],
                        j["rated"],
                        j["refund"],
                        product_object["name"],
                        product_object["image"],
                        str(j["itemId"])
                    ]
                )
            
            address = address_db.find_one({"_id":i["address"]})
            send.append([
                i["orderNo"],
                products,
                address["detail"],
                i["date"],
                i["price"],
                i["delivery_status"],
                address["phoneNumber"],
                str(i["_id"]),
                str(i["customer"])
            ])
        except:
            pass
    
    

    return HttpResponse(json.dumps({0:send}), content_type = "application/json",  status=200)

def getProfileInfo(request: HttpRequest):
    try:
        token = request.headers["Authorization"][7:]
        token_dec = jwt.decode(token, key="cs308", algorithms=["HS256"])
        
    except:
        return HttpResponse(json.dumps({'error': 'No authorization'}), content_type="application/json", status=401)
    
    customers = connect_collection("customers")
    customer = customers.find_one({"_id": ObjectId(token_dec["id"])})
    addresses = customer["address"]
    adr_arr = []

    for i in addresses:
        adres = connect_collection("addresses").find_one({"_id": ObjectId(i)})
        adr_arr.append(
           [ adres["name"],
            adres["phoneNumber"],
            adres["detail"]]
        )
            
    return HttpResponse(json.dumps(adr_arr), content_type="application/json", status=200)

def moreProfileInfo(request: HttpRequest):
    try:
        token = request.headers["Authorization"][7:]
        token_dec = jwt.decode(token, key="cs308", algorithms=["HS256"])
        
    except:
        return HttpResponse(json.dumps({'error': 'No authorization'}), content_type="application/json", status=401)
    customers = connect_collection("customers")
    customer = customers.find_one({"_id": ObjectId(token_dec["id"])})
    ret = []
    ret.append(customer["name"])
    ret.append(customer["surname"])
    ret.append(customer["email"])
    ret.append(customer["type"])
    ret.append(customer["tax_id"])

    return HttpResponse(json.dumps(ret), content_type="application/json", status=200)




def changeDeliverySta(request:HttpRequest):
    body = json.loads(request.body.decode())
    id = body["id"]
    value = body["value"]

    connect_collection("orders").update_one({"_id": ObjectId(id)}, {"$set": {"delivery_status": value}})

    return HttpResponse(status=200)

def changeRefundSta(request:HttpRequest):
    body = json.loads(request.body.decode())
    order_id = body["order_id"]
    product_id = body["id"]
    value = body["ref"]
    if value != "None" and value != "Requested" and value != "Accepted" and value != "Declined":
        return HttpResponse(status=401)
    try:
        order = connect_collection("orders").find_one({"_id":ObjectId(order_id)})
    except:
        return HttpResponse(status=402)
    cust_id = order["customer"]
    products = order["products"]
    index = -1
    for i in range(len(products)):
        if products[i]["itemId"] == ObjectId(product_id):
            products[i] = {
                "itemId" : products[i]["itemId"],
                "price" : products[i]["price"],
                "qty" : products[i]["qty"],
                "commented" : products[i]["commented"],
                "rated" : products[i]["rated"],
                "refund" : value
            }
            index = i
    connect_collection("orders").update_one( {"_id": ObjectId(order_id)}, {"$set": {"products": products}} )

    if value == "Accepted":
        product = connect_collection("products")
        stock = product.find_one({"_id": ObjectId(product_id)})["stock"]
        product.update_one( {"_id": ObjectId(product_id)}, {"$set": {"stock":stock+1}})
        customer = connect_collection("customers").find_one({"_id": cust_id})
        product = product.find_one({"_id":ObjectId(product_id)})
        with mail.get_connection() as connection:
            email = EmailMessage(
                "Refund request is accepted",
                f"Dear {customer['name']},\n\nThe return request for {product['name']} in your order number {order['orderNo']} has been approved. {order['products'][index]['price']} TL has been deposited in your account..\n\nBest,\nPEAR.",
                "noreply@pear.com",
                [customer["email"]],
                connection=connection
            )
        
        email.send()


    return HttpResponse(status=200)
