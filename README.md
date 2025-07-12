# ☕ Palate - Coffee Tasting Notes

> Professional coffee tasting note application with OCR technology

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/memune/palate)
[![Next.js](https://img.shields.io/badge/Next.js-15.3.5-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-blue)](https://www.typescriptlang.org/)

## 🚀 Features

- **📸 OCR Integration**: Extract coffee information from photos using Google AI
- **📝 Digital Tasting Notes**: Comprehensive coffee evaluation system
- **👤 User Authentication**: Secure login with Supabase
- **📱 Responsive Design**: Optimized for mobile and desktop
- **⚡ Performance Optimized**: 93% bundle size reduction with advanced optimizations

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Database + Auth)
- **OCR**: Google AI (Gemini 1.5 Flash)
- **State Management**: React Query (TanStack Query)
- **Deployment**: Vercel

## 📊 Performance Optimizations

- ✅ Component memoization with React.memo
- ✅ Code splitting and lazy loading
- ✅ Image optimization and compression
- ✅ React Query for server state management
- ✅ Bundle size optimization (93% reduction)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/memune/palate.git
   cd palate
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_GOOGLE_AI_API_KEY=your_google_ai_api_key
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

## 🚀 Deployment

### Automatic Deployment with Vercel

1. **Fork this repository**
2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your forked repository
   - Add environment variables
   - Deploy!

### Manual Deployment

```bash
# Build the application
npm run build

# Deploy to Vercel
npx vercel --prod
```

## 📱 Usage

1. **Sign up/Login** with your email
2. **Capture** coffee packaging or menu with your camera
3. **OCR Processing** extracts text automatically
4. **Fill in details** and rate your coffee experience
5. **Save & Review** your tasting notes

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend as a Service
- [Google AI](https://ai.google.dev/) - OCR technology
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Vercel](https://vercel.com/) - Deployment platform

---

**Built with ❤️ for coffee enthusiasts**