# Welcome to HeartSync - The Dating Application.

To run this project, follow below steps:

Under ShowProfileServer.py file, edit this line and add custom DB path

`app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///C:\\Users\\pavit\\Desktop\\react-chat-app\\src\\users.db'`

### Backend:
There are two servers that needs to be run for this application.
1) Go to src directory in terminal and run `python chat_backend.py`. This would run the conversation feature of the application.

2) Go to src directory in terminal and run `python ShowProfileServer.py`. This would run the profile recommendation feature of the application.

### Frontend:
1) Go to the home directory of this project and run `npm start`. This would open up the UI on port 3000.

Add the databases users.db and conversations.db in **DB Browser for SQLite**.
