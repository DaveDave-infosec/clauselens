import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./routes/Home"
import HowItWorks from "./routes/HowItWorks"
import Analyze from "./routes/Analyze"
import Verify from "./routes/Verify"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/analyze" element={<Analyze />} />
        <Route path="/verify" element={<Verify />} />
      </Routes>
    </BrowserRouter>
  )
}
