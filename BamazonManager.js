var inquirer = require('inquirer');
require('console.table');
var json = require('json');
var mysql = require('mysql');

var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,
	user: "root",
	password: "root",
	database: "Bamazon"
})

connection.connect(function(err) {
	if (err) throw err;
	console.log('Connected to Bamazon on Port 3306');
	runInquirer();
})

var questions = [
	{
		name: 'option',
		type: 'list',
		message: 'What would you like to do?',
		choices: ['View Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product', 'Exit'],
		filter: function (val) {
			return val.toLowerCase();
		}
	}
];

var runInquirer = function() {

		inquirer.prompt(questions).then(function(answer) {
			switch(answer.option) {
				case 'view products for sale': {
					var query = 'SELECT ItemID, ProductName, Price, StockQuantity FROM Bamazon.Products';
					connection.query(query, function(err, res) {
						console.table(res);
						runInquirer();
					});

					break;
				}

				case 'view low inventory': {
					var query = 'SELECT ItemID, ProductName, Price, StockQuantity FROM Bamazon.Products WHERE StockQuantity < 5';
					connection.query(query, function(err, res) {
						console.table(res);
						runInquirer();
					});
					break;
				}

				case 'add to inventory': {
					var questions_add = [
					{
						type: 'input', 
						name: 'item',
						message: 'Please enter product ID'
					},
					{
						type: 'input',
						name: 'quantity',
						message: 'How many do you want to add?',
						validate: function (value) {
							var valid = !isNaN(parseFloat(value));
							return valid || 'Please enter a number';
						},
						filter: Number
					}
					];

					inquirer.prompt(questions_add).then(function(answer_add) {
						console.log(answer_add.item);
						var new_quantity = (answer_add.quantity);
						var prevQuantity = 0;
						connection.query('SELECT * FROM Bamazon.Products WHERE ?', {itemID:answer_add.item},
							function(err, res) {
								console.log('console ' + res[0].StockQuantity);
								prevQuantity = (res[0].StockQuantity);
								console.log('a ' + prevQuantity);
								new_quantity = new_quantity + prevQuantity;
								console.log('pq ' + prevQuantity);
						
								console.log('new_quantity ' + new_quantity);
								connection.query('UPDATE Bamazon.Products SET ? WHERE ?', 
								[{
									StockQuantity: new_quantity
								}, 
								{
									ItemID: answer_add.item
								}], 
								function(err, res) {
									console.log(new_quantity);
									console.log('Database updated');
									runInquirer();
								}
							);
						});
					
					});
					
					break;
				}

				case 'add new product': {
					var questions_addnew = [
					{
						type: 'input',
						name: 'item',
						message: 'Please enter product ID: '
					},
					{
						type: 'input',
						name: 'product',
						message: 'Please enter product name: '
					},
					{
						type: 'input',
						name: 'department',
						message: 'Please enter department: '
					},
					{
						type: 'input',
						name: 'price',
						message: 'Please enter price of item: ',	
						validate: function (value) {
							var valid = !isNaN(parseFloat(value));
							return valid || 'Please enter a number';
						},
						filter: Number
					},
					{
						type: 'input',
						name: 'quantity',
						message: 'Please enter stock quantity: ',
						validate: function (value) {
							var valid = !isNaN(parseFloat(value));
							return valid || 'Please enter a number';
						},
						filter: Number
					}]
					inquirer.prompt(questions_addnew).then(function(answer_addnew) {
						connection.query('INSERT INTO Bamazon.Products SET ?', {
							ItemID: answer_addnew.item, 
							ProductName: answer_addnew.product, 
							DepartmentName: answer_addnew.department,
							Price: answer_addnew.price, 
							StockQuantity: answer_addnew.quantity}, function(err, res) {
								if (err) {
									console.log(err);
								} else {
									console.log('adding new product...')
									runInquirer();
								}
						});
					});	
					break;

				}

				case 'exit': {
					console.log('Terminating connection...');
					connection.end();
				}

				default: {
					break;
				}

			}
			
//			connection.end();

			// }








		// var query = 'SELECT ItemID, ProductName, Price, StockQuantity FROM Bamazon.Products WHERE ?';
		// connection.query(query, {ItemID:answer.item}, function(err, res) {
		// 	//console.log(res);
		// 	if (res.length == 0) {
		// 		console.log('Invalid item');
		// 	}
		// 	//console.log(res[0].StockQuantity);
		// 	if (res[0].StockQuantity >= answer.quantity) {
		// 		var updatedQuantity = res[0].StockQuantity - answer.quantity;
		// 		console.log('Your total cost of buying ' + answer.quantity + ' units of ' + 
		// 			res[0].ProductName + ' is $' + (answer.quantity * res[0].Price).toFixed(2));
		// 		connection.query('UPDATE Bamazon.Products SET ? WHERE ?', 
		// 			[{
		// 				StockQuantity: updatedQuantity
		// 			},
		// 			{
		// 				itemID: answer.item
		// 			}], function(err, res) {
		// 			console.log('Database updated');
		// 		});
//				connection.query('SELECT ItemID, ProductName, Price, StockQuantity FROM Bamazon.Products WHERE ?', 
//					{
//						ItemID:answer.item
//					}, function(err, res) {
//				});
		// 	// 	connection.end();
		// 	// } else {
		// 	// 	console.log('Insufficient quantity!');
		// 	// }
		// })
	})
}