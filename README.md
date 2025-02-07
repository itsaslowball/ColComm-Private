
# **ColComm - College Communication Platform**

ColComm is a real-time communication platform designed to connect mentees with mentors based on specific fields of expertise and skills. This platform allows users to easily find and communicate with mentors who have the skills they need, ask questions, and receive guidance. The platform features chat capabilities, group discussions, a blog section, and robust AI-driven content moderation to ensure a safe and productive environment.

<img width="1512" alt="image" src="https://github.com/user-attachments/assets/4ce711d4-8044-4635-9852-6e2e0fcb6e86" />


## **Features**

- **Mentor-Mentee Connection**: Mentees can find mentors based on specific skills (e.g., React, Node.js, Placement Preparation), allowing for easier and more targeted help-seeking.
  
- **Real-Time Communication**: Real-time chat functionality allows mentees and mentors to communicate instantly.
  
- **Group Discussions**: Dedicated groups can be created based on various topics such as:
  - React Group
  - Node.js Group
  - Placement Preparation Group
  - And more!

- **Blog Feature**: Mentors or seniors can write blogs to share insights, tips, or resources with the community. For example, interview preparation tips or coding tutorials can be shared and read by all users.
  
- **AI-based Content Moderation**: All chat messages undergo an abusive word detection system. This ensures that harmful content, such as hate speech and offensive language, is filtered out with 94% accuracy.

- **User Reporting System**: Users can report any content or individuals they find inappropriate, ensuring that the community remains safe and productive.

---

## **Setup Guide**

This guide will walk you through setting up and running the ColComm platform locally.

### **Prerequisites**

Before setting up the project, ensure that you have the following installed:

- **[Node.js](https://nodejs.org/)**: Required for running the frontend and backend JavaScript services.
- **[Python](https://www.python.org/)**: Required for running the backend Python service.

### **Clone the Repository**

Start by cloning the ColComm repository to your local machine:

```bash
git clone https://github.com/priyanshu-34/ColComm-Private
```

### **Install Dependencies**

#### In the **root folder**:
- Open the terminal in the root folder of the cloned repository.

#### In the **frontend folder**:
- Open a new terminal and navigate to the `frontend` folder.

Install the necessary dependencies in **both terminals**:

```bash
npm install
```

---

### **Start the Application**

After installing the dependencies, start the application in **both terminals**:

```bash
npm run start
```

---

### **Set Up Ngrok**

To expose your local backend server, you will use Ngrok. If you don't have an Ngrok account, you can sign up at [Ngrok](https://ngrok.com/).

1. **Configure Ngrok with your authtoken**:
   
   In a new terminal, run the following command to add your Ngrok authtoken:

   ```bash
   ngrok config add-authtoken <your-authtoken>
   ```

2. **Create a Tunnel with Ngrok**:
   
   Start the Ngrok tunnel for your backend service running on port 5000:

   ```bash
   ngrok http --domain=monthly-caring-bear.ngrok-free.app 5000
   ```

---

### **Install Backend Dependencies**

In another terminal, navigate to the `backend` folder where the `app.py` file is located and install the required Python dependencies:

```bash
pip3 install flask transformers torch
```

---

### **Start the Backend**

Run the backend service using Python:

```bash
python app.py
```

---

### **Access the Application**

Once both the frontend and backend services are running, open your browser and navigate to the following URL:

[http://localhost:3000/chats](http://localhost:3000/chats)

You should see the ColComm platform up and running. You can log in, search for mentors based on skills, participate in group chats, read blogs, and much more.

---

## **Summary of Commands**

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/priyanshu-34/ColComm-Private
   ```

2. **Install Dependencies in Both Terminals**:

   ```bash
   npm install
   ```

3. **Start the Application** in Both Terminals:

   ```bash
   npm run start
   ```

4. **Set Up Ngrok**:

   ```bash
   ngrok config add-authtoken <your-authtoken>
   ngrok http --domain=monthly-caring-bear.ngrok-free.app 5000
   ```

5. **Install Backend Dependencies**:

   ```bash
   pip3 install flask transformers torch
   ```

6. **Start the Backend**:

   ```bash
   python app.py
   ```

7. **Access the Application**:

   [http://localhost:3000/chats](http://localhost:3000/chats)

---

## **Contributing**

If you would like to contribute to the ColComm project, feel free to fork the repository and submit a pull request.
