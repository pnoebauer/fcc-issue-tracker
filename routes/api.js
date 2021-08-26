// 'use strict';
require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

mongoose.set('useFindAndModify', false);

const issueSchema = new mongoose.Schema(
	{
		project_title: String,
		issue_title: {type: String, required: true},
		issue_text: {type: String, required: true},
		created_by: {type: String, required: true},
		assigned_to: String,
		status_text: String,
		open: Boolean,
		status_text: String,
		// createdAt: {type: Date, default: Date.now, transform: v => v.toDateString()},
		// updatedAt: {type: Date, default: Date.now, transform: v => v.toDateString()},
	},
	{
		timestamps: {
			createdAt: 'created_on',
			updatedAt: 'updated_on',
		},
	}
);

const Issue = mongoose.model('Issue', issueSchema);
// Issue.deleteMany({}, () => console.log('deleted all'));

module.exports = async function (app) {
	app
		.route('/api/issues/:project')

		.get(async function (req, res) {
			console.log('get');
			const project = req.params.project;
			// console.log(project, req.query);

			// return everything except the __v field
			// const issues = await Issue.find({}).select('-__v').exec();
			const issues = await Issue.find({project_title: project, ...req.query})
				.select('-__v')
				.exec();

			// console.log('----issues', issues);

			return res.json(issues);
		})

		.post(async function (req, res) {
			console.log('post');
			const project = req.params.project;

			// console.log(req.body, req.params);
			// let issueObject = {project_title: project, open: true};

			// Object.keys(req.body).forEach(
			// 	key => req.body[key].length && (issueObject[key] = req.body[key])
			// );

			try {
				// console.log('try adding')
				// const addedIssue = await new Issue(issueObject).save();

				const addedIssue = await new Issue({
					...req.body,
					open: true,
					project_title: project,
					assigned_to: req.body.assigned_to || '',
					status_text: req.body.status_text || '',
				}).save();
				// console.log({addedIssue})

				// const clonedIssue = JSON.parse(JSON.stringify(addedIssue));

				// const {project_title, __v, ...resObj} = clonedIssue;
				// const resObj = {_id: addedIssue['_id'], open: true, created_on: addedIssue.created_on, updated_on: addedIssue.updated_on, ...req.body};
				const resObj = {
					issue_title: req.body.issue_title,
					issue_text: req.body.issue_text,
					created_by: req.body.created_by,
					assigned_to: req.body.assigned_to || '',
					status_text: req.body.status_text || '',
					created_on: addedIssue.created_on,
					updated_on: addedIssue.updated_on,
					open: true,
					_id: addedIssue['_id'],
				};

				// console.log(resObj);

				if (addedIssue) {
					// console.log(resObj,'------------post res')
					return res.json(resObj);
				} else {
					// console.log('-------- error ---- required field(s) missing')
					return res.json({error: 'required field(s) missing'});
				}

				// const {
				// 	_id,
				// 	project_title,
				// 	issue_title,
				// 	issue_text,
				// 	created_by,
				// 	assigned_to,
				// 	status_text,
				// 	created_at,
				// 	updated_at,
				// } = addedIssue;
				// // console.log(addedIssue);

				// if (addedIssue) {
				// 	// return res.json(addedIssue);
				// 	return res.json({
				// 		_id,
				// 		project_title,
				// 		issue_title,
				// 		issue_text,
				// 		created_by,
				// 		assigned_to,
				// 		status_text,
				// 		created_at: created_at.toDateString(),
				// 		updated_at: updated_at.toDateString(),
				// 	});
				// } else {
				// 	return res.json({error: 'error adding the issue to the db'});
				// }
			} catch (e) {
				// console.log('-------- error INSERT---- required field(s) missing')

				res.json({error: 'required field(s) missing'});
			}
		})

		.put(async function (req, res) {
			console.log('put');

			const project = req.params.project;

			const {_id, ...updatedData} = req.body;

			if (!_id) {
				return res.json({error: 'missing _id'});
			}
			if (!Object.keys(updatedData).length) {
				return res.json({error: 'no update field(s) sent', _id: _id});
			}

			let updatedIssueObject = {};

			Object.keys(updatedData).forEach(
				key => updatedData[key].length && (updatedIssueObject[key] = updatedData[key])
			);

			// console.log(req.body);

			// const findIssue = await Issue.findById(_id).exec();
			// console.log(findIssue);
			try {
				const updatedIssue = await Issue.findOneAndUpdate({_id}, updatedIssueObject, {
					// upsert: false,
					new: true,
				}).select('-__v');
				// console.log(updatedIssue, '------up');

				// const {
				// 	issue_title,
				// 	issue_text,
				// 	created_by,
				// 	assigned_to,
				// 	status_text,
				// 	created_at,
				// 	updated_at,
				// } = updatedIssue;

				if (updatedIssue) {
					// console.log({  result: 'successfully updated', '_id': _id })
					return res.json({result: 'successfully updated', _id: _id});
					// 	return res.json({
					// 		issue_title,
					// 		issue_text,
					// 		created_by,
					// 		assigned_to,
					// 		status_text,
					// 		created_at: created_at.toDateString(),
					// 		updated_at: updated_at.toDateString(),
					// });
				} else {
					return res.json({error: 'could not update', _id: _id});
				}
			} catch (e) {
				return res.json({error: 'could not update', _id: _id});
			}
		})

		.delete(async function (req, res) {
			console.log('delete');
			const project = req.params.project;

			const {_id} = req.body;

			if (!_id) {
				return res.json({error: 'missing _id'});
			}

			try {
				const deletedIssue = await Issue.findByIdAndDelete({_id}).select('-__v');
				// console.log(deletedIssue, '------deleted');
				if (deletedIssue) {
					// return res.json(addedIssue);
					return res.json({result: 'successfully deleted', _id: _id});
				} else {
					return res.json({error: 'could not delete', _id: _id});
				}
			} catch (e) {
				return res.json({error: 'could not delete', _id: _id});
			}
		});
};
