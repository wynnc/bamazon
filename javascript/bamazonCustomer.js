var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",
  port: 8889,
  user: "root",
  password: "root",
  database: "bamazonDB"
});

connection.connect(function (err) {
  if (err) throw err;
  runInventory();
});


function runInventory() {
  var query = "SELECT * FROM products";
  connection.query(query, function (err, res) {
    if (err) throw err;

    console.table(res);
    promptUser(res);

  })

  // connection.end();

}

// 7. Once the customer has placed the order, your application should check if your store has enough of the product to meet the customer's request.

//    * If not, the app should log a phrase like `Insufficient quantity!`, and then prevent the order from going through.

// 8. However, if your store _does_ have enough of the product, you should fulfill the customer's order.
//    * This means updating the SQL database to reflect the remaining quantity.
//    * Once the update goes through, show the customer the total cost of their purchase.

function promptUser(inventory) {
  inquirer.prompt([
    {
      type: "input",
      name: "userChoice",
      message: "What is the ID of the item you would you like to purchase? (^C to exit)",
      validate: function (val) {
        return !isNaN(val) || val.toLowerCase() === 'e';
      }
    }
  ])
    .then(function (val) {

      var userChoiceId = parseInt(val.userChoice);
      // verify id is valid
      var stock = checkInventory(userChoiceId, inventory)
      if (stock) {
        promptQuantity(stock)
      } else {
        console.log("Please select a valid item.");
        runInventory();
      }


    });
}

function promptQuantity(stock) {
  inquirer.prompt([
    {
      type: "input",
      name: "quantity",
      message: "How many do you want?",
      validate: function (val) {
        return !isNaN(val);
      }
    }
  ])
    .then(function (val) {
      var quantity = parseInt(val.quantity);
      
      if (quantity > stock.stock_quantity) {
        console.log("\nInsufficient quantity!");
        runInventory();
      }
      else {
       
        // console.log(stock);
        makeTransaction(stock, quantity)
        
      }
    })
}

function checkInventory(userChoiceId, inventory) {
  for (var i = 0; i < inventory.length; i++) {
    if (inventory[i].item_id === userChoiceId) {
     
      return inventory[i];
    }
  }
  
  return null;
}

function makeTransaction(stock, quantity) {
  
  connection.query(
    "UPDATE products SET stock_quantity = stock_quantity - ? WHERE item_id = ?",
    [quantity, stock.item_id],
    function(err, res) {
      
      console.log(`Successfully purchased ${quantity} of ${stock.product_name}.`)
      
      runInventory();
    }
  );
}
