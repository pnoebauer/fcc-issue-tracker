const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {
	let createdId = '';
	test('Create an issue with every field: POST request to /api/issues/{project}', function (done) {
		chai
			.request(server)
			.post('/api/issues/apitest')
			.send({
				issue_title: 'test',
				issue_text: 'test case',
				created_by: 'Phil',
				assigned_to: 'Joe',
				status_text: 'Not finished',
			})
			.end(function (err, res) {
				createdId = res.body._id;

				assert.equal(res.status, 200);
				// assert.equal(res.body.issue_title, 'test');
				// assert.equal(res.body.issue_text, 'test case');
				assert.deepEqual(res.body, {
					_id: res.body._id,
					project_title: 'apitest',
					issue_title: 'test',
					issue_text: 'test case',
					created_by: 'Phil',
					assigned_to: 'Joe',
					status_text: 'Not finished',
					created_at: new Date().toDateString(),
					updated_at: new Date().toDateString(),
				});
				done();
			});
	});
	test('Create an issue with only required fields: POST request to /api/issues/{project}', function (done) {
		chai
			.request(server)
			.post('/api/issues/apitest')
			.send({
				issue_title: 'test 2',
				issue_text: 'test case 2',
				created_by: 'Phil',
			})
			.end(function (err, res) {
				assert.equal(res.status, 200);
				// assert.equal(res.body.issue_title, 'test');
				// assert.equal(res.body.issue_text, 'test case');
				assert.deepEqual(res.body, {
					_id: res.body._id,
					project_title: 'apitest',
					issue_title: 'test 2',
					issue_text: 'test case 2',
					created_by: 'Phil',
					created_at: new Date().toDateString(),
					updated_at: new Date().toDateString(),
				});
				done();
			});
	});
	test('Create an issue with missing required fields: POST request to /api/issues/{project}', function (done) {
		chai
			.request(server)
			.post('/api/issues/apitest')
			.send({
				issue_title: 'test 2',
				issue_text: 'test case 2',
			})
			.end(function (err, res) {
				assert.equal(
					res.body.error,
					'error adding issue, check the form input data types'
				);
				assert.equal(res.status, 400);
				done();
			});
	});
	test('View issues on a project: GET request to /api/issues/{project}', function (done) {
		chai
			.request(server)
			.get('/api/issues/apitest')
			.end(function (err, res) {
				assert.isArray(res.body);
				done();
			});
	});
	test('View issues on a project with one filter: GET request to /api/issues/{project}', function (done) {
		chai
			.request(server)
			.get('/api/issues/apitest?open=true')
			.end(function (err, res) {
				assert.isArray(res.body);

				const allOpenTrue = res.body.every(issue => issue.open);
				assert.isTrue(allOpenTrue);

				res.body.forEach(issue => assert.isTrue(issue.open, issue.issue_title));

				done();
			});
	});
	test('View issues on a project with multiple filters: GET request to /api/issues/{project}', function (done) {
		chai
			.request(server)
			.get('/api/issues/apitest?open=true&assigned_to=Joe')
			.end(function (err, res) {
				assert.isArray(res.body);

				const allOpenTrue = res.body.every(
					issue => issue.open && issue.assigned_to === 'Joe'
				);
				assert.isTrue(allOpenTrue);

				res.body.forEach(issue =>
					assert.isTrue(issue.open && issue.assigned_to === 'Joe', issue.issue_title)
				);

				done();
			});
	});
	test('Update one field on an issue: PUT request to /api/issues/{project}', function (done) {
		chai
			.request(server)
			.put('/api/issues/apitest')
			.send({
				_id: createdId,
				issue_title: 'updated test',
			})
			.end(function (err, res) {
				assert.equal(res.status, 200);
				assert.equal(res.body.issue_title, 'updated test');
				// assert.deepEqual(res.body, {
				// 	issue_title: 'updated test',
				// 	issue_text: 'test case',
				// 	created_by: 'Phil',
				// 	assigned_to: 'Joe',
				// 	status_text: 'Not finished',
				// 	created_at: new Date().toDateString(),
				// 	updated_at: new Date().toDateString(),
				// });
				done();
			});
	});
	test('Update multiple fields on an issue: PUT request to /api/issues/{project}', function (done) {
		chai
			.request(server)
			.put('/api/issues/apitest')
			.send({
				_id: createdId,
				issue_title: 'updated test',
				issue_text: 'updated test case',
			})
			.end(function (err, res) {
				assert.equal(res.status, 200);
				assert.equal(res.body.issue_title, 'updated test');
				assert.equal(res.body.issue_text, 'updated test case');
				// assert.deepEqual(res.body, {
				// 	issue_title: 'updated test',
				// 	issue_text: 'updated test case',
				// 	created_by: 'Phil',
				// 	assigned_to: 'Joe',
				// 	status_text: 'Not finished',
				// 	created_at: new Date().toDateString(),
				// 	updated_at: new Date().toDateString(),
				// });
				done();
			});
	});
	test('Update an issue with missing _id: PUT request to /api/issues/{project}', function (done) {
		chai
			.request(server)
			.put('/api/issues/apitest')
			.send({
				issue_title: 'updated test',
			})
			.end(function (err, res) {
				assert.equal(
					res.body.error,
					'error updating issue, check the form input data types'
				);
				assert.equal(res.status, 400);
				done();
			});
	});
});
