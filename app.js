

const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");


const app = express();
const _ = require("lodash");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser:true});

const todolistSchema = {
  name: String
}; 

const Item = mongoose.model("Item",todolistSchema);

const listSchema ={
  name:String,
  item:[todolistSchema]
}

const List = mongoose.model("List", listSchema); 

const item1 = new Item({
  name:"Welcome to your todolist!"
});

const item2 = new Item({
  name:"Hit + button to add item"
});

const item3 = new Item({
  name:"<-- Hit this button to delete item"
});

const defaultItems = [item1,item2,item3];


app.get("/", function(req, res) {

  

  Item.find({},function(err,foundItem){
    if(foundItem.length===0){
      Item.insertMany(defaultItems,function(err){
        if(err){
         console.log(err);
        } else{
          console.log("Items added!");
        }
       });
       res.redirect("/");
    }
    else{
    res.render("list", {listTitle: "Today", newListItems: foundItem});
    }
  })

  

});

app.post("/delete",function(req,res){ 
const chekedItemId = req.body.checkbox;

 const listName= req.body.listName;

 if(listName==="Today"){
  Item.findByIdAndRemove(chekedItemId,function(err){
    if(err){
      console.log(err);
    }else{
      console.log("Success!");
      res.redirect("/");
    }
  })
  
 } else{
   List.findOneAndUpdate({name:listName},{$pull:{item:{_id:chekedItemId}}},function(err,foundList){
     if(!err){
       res.redirect("/"+listName); 
     }
   });
 }

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;

  const listName = req.body.list;

  
    const item = new Item({
      name: itemName
    });
   
    
      if(listName==="Today"){
        item.save();
        res.redirect("/");
      
      }else{
        List.findOne({name:listName},function(err,foundList){
          foundList.item.push(item);
          foundList.save();
          res.redirect("/"+ listName);
        })
      }
  
   
 
  
  
  

});

app.get("/:customListName",function(req,res){

  const customListName=_.capitalize(req.params.customListName);

  List.findOne({name: customListName},function(err,foundList){
    if(!err){
     if(!foundList){
       //create list
       const list = new List({
        name: customListName,
        item: defaultItems
      });
      list.save();
      res.redirect("/" + customListName);
        
    }else{
     res.render("list",{listTitle:foundList.name,newListItems:foundList.item })
    }
  }
  })

 
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
