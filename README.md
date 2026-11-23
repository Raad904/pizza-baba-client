🍕 Pizza Baba
A pizza delivery web application where customers can explore the menu
and place orders, vendors can manage orders, and the admin can manage
the platform.
🌐 Live Website
Visit Pizza Baba
📖 About the Project
Pizza Baba is a food delivery web application built to make ordering
pizza simple and convenient. The platform supports different user roles
and provides features for managing menu items and orders.
✨ Features
- Browse pizza and food menu items
- User registration and sign-in
- Customer and vendor accounts
- Role-based dashboards
- Place and manage orders
- View customer orders
- Vendor order management
- Accept or reject orders
- Update order status
- Admin menu and user management
- Account status management
- Responsive user interface
🛠️ Technologies Used
Frontend
- Next.js
- React
- Tailwind CSS
- Lucide React
Backend & Database
- Node.js
- Express.js
- MongoDB
- Better Auth
🚀 Getting Started
1. Clone the Repository
git clone <YOUR_FRONTEND_REPOSITORY_URL>
2. Navigate to the Project Folder
cd pizza-baba-client
3. Install Dependencies
npm install
4. Configure Environment Variables
Create a .env.local file in the frontend project root:
NEXT_PUBLIC_API_URL=http://localhost:5000
Add any other authentication or service environment variables required
by your project configuration. Never commit secret keys or credentials.
5. Start the Development Server
npm run dev
Open http://localhost:3000 in your browser.
📁 Project Structure
The frontend uses the Next.js App Router structure. Main pages and
reusable components are organized inside the src directory.
pizza-baba-client/
├── public/
├── src/
│   ├── app/
│   ├── components/
│   └── lib/
├── .env.local
├── package.json
└── README.md
🔐 User Roles
- Customer: Browse menu items and manage orders.
- Vendor: Manage incoming orders and update order progress.
- Admin: Manage users and platform content.
🚢 Deployment
The frontend is deployed on Vercel.

Live URL: https://pizza-baba-client.vercel.app/
👨‍💻 Author
Developed as a web application project.
⭐ Thank you for visiting Pizza Baba!