const mongoose = require('mongoose')

mongoose.set('strictQuery', false)


const url = process.env.MONGODB_URI

mongoose.connect(url)
	.then(() => {
		console.log('connected to MongoDB')
	})
	.catch((error) => {
		console.log('error connecting to MongoDB:', error.message)
	})

const personSchema = new mongoose.Schema({
	name: {
		type: String,
		minLength: 3,
		required: [true, 'User name is required'],
		unique: true
	},
	number: {
		type: String,
		validate: {
			validator: function(v) {
				return /^\d{2,3}-\d{3,}$/.test(v)
			},
			message: props => `${props.value} is not a valid phone number!`
		},
		required: [true, 'User phone number is required']
	},
})

personSchema.set('toJSON', {
	transform: (document, returnedObject) => {

		returnedObject.id = returnedObject._id.toString()
		delete returnedObject._id
		delete returnedObject.__v
	}
})

module.exports = mongoose.model('Person', personSchema)
