var inquirer = require('inquirer');
var console_table = require('console.table');
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
		name: 'item',
		type: 'input',
		message: 'Please enter product ID'
	},
	{
		name: 'quantity',
		type: 'input',
		message: 'Please enter desired quantity'
	}
];

var runInquirer = function() {

		inquirer.prompt(questions).then(function(answer) {
		//console.log(answer);
		//console.log(answer.item);
		//console.log(answer.quantity);
		var query = 'SELECT ItemID, ProductName, Price, StockQuantity FROM Bamazon.Products WHERE ?';
		//console.log(query);
		connection.query(query, {ItemID:answer.item}, function(err, res) {
			//console.log(res);
			if (res.length == 0) {
				console.log('Invalid item');
			}
			//console.log(res[0].StockQuantity);
			if (res[0].StockQuantity >= answer.quantity) {
				var updatedQuantity = res[0].StockQuantity - answer.quantity;
				console.log('Your total cost of buying ' + answer.quantity + ' units of ' + 
					res[0].ProductName + ' is $' + (answer.quantity * res[0].Price).toFixed(2));
				connection.query('UPDATE Bamazon.Products SET ? WHERE ?', 
					[{
						StockQuantity: updatedQuantity
					},
					{
						itemID: answer.item
					}], function(err, res) {
					console.log('Database updated');
				});
//				connection.query('SELECT ItemID, ProductName, Price, StockQuantity FROM Bamazon.Products WHERE ?', 
//					{
//						ItemID:answer.item
//					}, function(err, res) {
//				});
				connection.end();
			} else {
				console.log('Insufficient quantity!');
			}
		})
	})
}