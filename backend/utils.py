import datetime
from pymongo import MongoClient
import certifi

#Connect database
def connect_collection(collection_name):
    client = MongoClient("mongodb+srv://cs308:cs308@cluster0.apbloyj.mongodb.net/?retryWrites=true&w=majority")
    db = client["cs308"]
    return db[collection_name]



def create_customer(collection, 
                  tax_id, email, name, surname,
                 password):
    try:
        data = {
                "tax_id" : tax_id,
                "email" : email,
                "name" : name,
                "surname" : surname,
                "password" : password,
                "cart" : [],
                "address" : [],
                "orders" : [],
                "wishlist" : [],
                "type" : "customer"
        }

        connect_collection(collection_name=collection).insert_one(data)
        return True
    
    except Exception as s:
        print(s)
        return False

def create_product(collection,
                   name, brand, description, model,
                   category, stock,
                   image, price, discount, cost, warranty,
                   distributer):
    try:
        data = {
            "name": name,
            "brand": brand,
            "description": description,
            "model": model,
            "category": category,
            "stock": stock,
            "image": image,
            "price": price,
            "discount": discount,
            "cost": cost,
            "warranty": warranty,
            "distributer": distributer,
            "wishlist_ids": [],
            "rating": [0,0.0]
        }

        connect_collection(collection_name=collection).insert_one(data)
        return True

    except Exception as s:
        print(s)
        return False
        
def create_comment( collection,
                    comment, product_id,
                    customer_id):
    try:
        data = {
                "comment" : comment,
                "product_id" : product_id,
                "customer_id" : customer_id,
                "date": datetime.datetime.now(),
                "status": "pending"
        }

        connect_collection(collection_name=collection).insert_one(data)
        return True
    
    except Exception as s:
        print(s)
        return False
    
def populate_order(order):
    order["id"] = str(order["_id"])
    del order["_id"]

    for i in range(len(order["products"])):
        id = order["products"][i]["itemId"]
        del order["products"][i]["itemId"]

        item = connect_collection("products").find_one_and_update({"_id": id}, {"$inc": {"stock": -(order["products"][i]["qty"])}})
        item["price"] = order["products"][i]["price"]
        item["qty"] = order["products"][i]["qty"]
        del item["_id"]
        del item["category"]
        del item["wishlist_ids"]
        order["products"][i] = item
        
    order["address"] = connect_collection("addresses").find_one({"_id": order["address"]})
    del order["address"]["_id"]

    order["customer"] = connect_collection("customers").find_one({"_id": order["customer"]})
    order["customer"] = {"name": order["customer"]["name"],
                         "surname": order["customer"]["surname"],
                         "tax_id": order["customer"]["tax_id"],
                         "email": order["customer"]["email"]}

    return order