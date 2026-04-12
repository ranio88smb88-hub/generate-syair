import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  RefreshCw, 
  Image as ImageIcon, 
  Download, 
  Send,
  Loader2,
  Moon,
  Sun,
  ScrollText,
  Dices,
  Star
} from "lucide-react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { generateSyair, generatePredictionImage } from "@/lib/gemini";

const PASARAN_OPTIONS = [
  "HOKIDRAW 5D",
  "TOTOMACAU PAGI",
  "KENTUCKY MIDDAY",
  "FLORIDA MIDDAY",
  "HUAHIN",
  "BANGKOK",
  "NEWYORK MIDDAY",
  "CAROLINA DAY",
  "BRUNEI",
  "OREGON",
  "CALIFORNIA",
  "FLORIDA EVENING",
  "NEWYORK EVENING",
  "KENTUCKY EVENING",
  "CAROLINA EVENING",
  "TOTO CAMBODIA LIVE",
  "CHELSEA",
  "BULLSEYE",
  "POIPET",
  "TOTOMACAU SIANG",
  "SYDNEY LOTTO",
  "TOTOMALI",
  "TOTOMACAU SORE",
  "KINGKONG 4D",
  "SINGAPORE",
  "MAGNUM4D",
  "TOTOMACAU MALAM",
  "PCSO",
  "NEVADA",
  "HONGKONG LOTTO"
];

const VISUAL_STYLE_OPTIONS = [
  "Cinematic", "Anime", "Cyberpunk", "Oil Painting", "Digital Art", "Surrealism"
];

const CHARACTER_OPTIONS = [
  "Mystic Oracle", "Ancient Wizard", "Goddess of Luck", "Cyber Seer", "Shadow Monk", "Celestial Being"
];

const BACKGROUND_OPTIONS = [
  "Royal Cream", "Mystic Realm", "Celestial Void", "Golden Temple", "Enchanted Forest"
];

const SHIO_OPTIONS = [
  "Naga", "Ular", "Kuda", "Kambing", "Monyet", "Ayam", "Anjing", "Babi", "Tikus", "Kerbau", "Macan", "Kelinci"
];

const SHIO_NUMBERS: Record<string, string[]> = {
  "Naga": ["01", "13", "25", "37", "49", "61", "73", "85", "97"],
  "Ular": ["02", "14", "26", "38", "50", "62", "74", "86", "98"],
  "Kuda": ["03", "15", "27", "39", "51", "63", "75", "87", "99"],
  "Kambing": ["04", "16", "28", "40", "52", "64", "76", "88", "00"],
  "Monyet": ["05", "17", "29", "41", "53", "65", "77", "89"],
  "Ayam": ["06", "18", "30", "42", "54", "66", "78", "90"],
  "Anjing": ["07", "19", "31", "43", "55", "67", "79", "91"],
  "Babi": ["08", "20", "32", "44", "56", "68", "80", "92"],
  "Tikus": ["09", "21", "33", "45", "57", "69", "81", "93"],
  "Kerbau": ["10", "22", "34", "46", "58", "70", "82", "94"],
  "Macan": ["11", "23", "35", "47", "59", "71", "83", "95"],
  "Kelinci": ["12", "24", "36", "48", "60", "72", "84", "96"]
};

export default function App() {
  const [formData, setFormData] = useState({
    dataPrediksi: "JP Paus",
    pasaran: "Hongkong",
    bbfs: "1234567",
    angkaMain: "1234",
    angka4d: "1234",
    angkaShio: "12",
    shio: "Naga",
    syair: "",
    visualStyle: "Cinematic",
    character: "Mystic Oracle",
    background: "Royal Cream",
    oracles: SHIO_NUMBERS["Naga"]
  });

  const [result, setResult] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState({
    all: false,
    syair: false,
    image: false,
    randomizing: false
  });

  const generateRandomNumbers = (count: number) => {
    return Array.from({ length: count }, () => Math.floor(Math.random() * 10)).join("");
  };

  const handleRandomize = useCallback(async (isInitial = false) => {
    if (!isInitial) setLoading(prev => ({ ...prev, randomizing: true }));
    
    const randomShio = SHIO_OPTIONS[Math.floor(Math.random() * SHIO_OPTIONS.length)];
    const newBbfs = generateRandomNumbers(7);
    const newAngkaMain = generateRandomNumbers(4);
    const newAngka4d = generateRandomNumbers(4);
    const shioNums = SHIO_NUMBERS[randomShio] || [];
    const newAngkaShio = shioNums[Math.floor(Math.random() * shioNums.length)] || "00";
    
    const newData = {
      ...formData,
      bbfs: newBbfs,
      angkaMain: newAngkaMain,
      angka4d: newAngka4d,
      angkaShio: newAngkaShio,
      shio: randomShio,
      oracles: shioNums,
      syair: "" 
    };

    setFormData(newData);
    
    if (!isInitial) {
      const newSyair = await generateSyair(newData);
      setFormData(prev => ({ ...prev, syair: newSyair }));
      setLoading(prev => ({ ...prev, randomizing: false }));
      
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.8 },
        colors: ['#D4AF37', '#4B0082']
      });
    }
  }, [formData]);

  useEffect(() => {
    handleRandomize(true);
    checkApiKey();
  }, []);

  const checkApiKey = async () => {
    try {
      if ((window as any).aistudio?.hasSelectedApiKey) {
        const selected = await (window as any).aistudio.hasSelectedApiKey();
        setHasApiKey(selected);
      }
    } catch (e) {
      console.warn("Failed to check API key selection state", e);
    }
  };

  const handleSelectKey = async () => {
    try {
      if ((window as any).aistudio?.openSelectKey) {
        await (window as any).aistudio.openSelectKey();
        setHasApiKey(true);
        setError(null);
      }
    } catch (e) {
      console.error("Failed to open API key selection dialog", e);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === "shio") {
      setFormData(prev => ({ 
        ...prev, 
        shio: value,
        oracles: SHIO_NUMBERS[value] || []
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleOracleChange = (index: number, value: string) => {
    const newOracles = [...formData.oracles];
    newOracles[index] = value;
    setFormData(prev => ({ ...prev, oracles: newOracles }));
  };

  const handleGenerateAll = async () => {
    setLoading(prev => ({ ...prev, all: true }));
    setError(null);
    try {
      let currentSyair = formData.syair;
      if (!currentSyair) {
        currentSyair = await generateSyair(formData);
      }
      
      const rawImageUrl = await generatePredictionImage({ ...formData, syair: currentSyair });
      
      // Overlay logo using canvas to guarantee it appears
      const finalImageUrl = await overlayLogo(rawImageUrl, { ...formData, syair: currentSyair });
      
      setResult({
        ...formData,
        syair: currentSyair,
        imageUrl: finalImageUrl
      });
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#4B0082', '#FFFDD0']
      });
    } catch (error: any) {
      console.error("Generation failed:", error);
      if (error.message === "QUOTA_EXHAUSTED") {
        setError("Quota generation gambar habis. Silakan gunakan API Key Anda sendiri untuk melanjutkan.");
      } else {
        setError("Gagal menghasilkan prediksi. Silakan coba lagi.");
      }
    } finally {
      setLoading(prev => ({ ...prev, all: false }));
    }
  };

  const overlayLogo = async (base64Image: string, data: any): Promise<string> => {
    const logoUrl = "https://ligabandot.com/resources/images/logo.png";
    
    // List of proxies to try in order
    const proxies = [
      (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
      (url: string) => `https://images.weserv.nl/?url=${encodeURIComponent(url)}`,
      (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`
    ];

    const fetchLogoAsDataUrl = async (): Promise<string | null> => {
      for (const proxyFn of proxies) {
        try {
          const response = await fetch(proxyFn(logoUrl));
          if (response.ok) {
            const blob = await response.blob();
            return new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
          }
        } catch (e) {
          console.warn(`Proxy failed: ${proxyFn(logoUrl)}`, e);
        }
      }
      return null;
    };

    try {
      const logoDataUrl = await fetchLogoAsDataUrl();

      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = 1200;
          canvas.height = 480;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(base64Image);
            return;
          }

          // Draw main image
          ctx.drawImage(img, 0, 0, 1200, 480);

          // Draw Date
          const now = new Date();
          const dateStr = now.toLocaleDateString('id-ID', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
          });
          
          ctx.save();
          // Use Playfair Display for a more premium look
          ctx.font = "bold italic 36px 'Playfair Display', serif"; 
          
          // Create a gold gradient for the text
          const gradient = ctx.createLinearGradient(900, 0, 1160, 0);
          gradient.addColorStop(0, "#D4AF37"); // Gold
          gradient.addColorStop(0.5, "#FFD700"); // Bright Gold
          gradient.addColorStop(1, "#B8860B"); // Dark Gold
          
          ctx.fillStyle = gradient;
          ctx.shadowBlur = 15;
          ctx.shadowColor = "rgba(0, 0, 0, 1)";
          ctx.textAlign = "right";
          ctx.fillText(dateStr, 1160, 70);
          
          // Add a more decorative line under the date
          ctx.beginPath();
          ctx.moveTo(850, 85);
          ctx.lineTo(1160, 85);
          const lineGradient = ctx.createLinearGradient(850, 0, 1160, 0);
          lineGradient.addColorStop(0, "transparent");
          lineGradient.addColorStop(0.5, "rgba(212, 175, 55, 0.8)");
          lineGradient.addColorStop(1, "transparent");
          ctx.strokeStyle = lineGradient;
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.restore();

          if (logoDataUrl) {
            const logo = new Image();
            logo.crossOrigin = "anonymous";
            logo.onload = () => {
              const logoWidth = 260; 
              const aspect = logo.height / logo.width;
              const logoHeight = logoWidth * aspect;
              
              ctx.save();
              // Stronger shadow for better visibility on any background
              ctx.shadowBlur = 40;
              ctx.shadowColor = "rgba(0, 0, 0, 1)";
              ctx.drawImage(logo, 40, 40, logoWidth, logoHeight);
              
              // Add a second pass for even more pop
              ctx.shadowBlur = 10;
              ctx.shadowColor = "rgba(212, 175, 55, 0.3)";
              ctx.drawImage(logo, 40, 40, logoWidth, logoHeight);
              
              ctx.restore();
              resolve(canvas.toDataURL("image/png"));
            };
            logo.onerror = () => {
              console.warn("Logo failed to load on canvas, returning image with date only");
              resolve(canvas.toDataURL("image/png"));
            };
            logo.src = logoDataUrl;
          } else {
            resolve(canvas.toDataURL("image/png"));
          }
        };
        img.onerror = () => resolve(base64Image);
        img.src = base64Image;
      });
    } catch (error) {
      console.error("Overlay process failed:", error);
      return base64Image;
    }
  };

  const handleRegenerateSyair = async () => {
    setLoading(prev => ({ ...prev, syair: true }));
    try {
      const newSyair = await generateSyair(formData);
      setFormData(prev => ({ ...prev, syair: newSyair }));
      if (result) {
        setResult((prev: any) => ({ ...prev, syair: newSyair }));
      }
    } finally {
      setLoading(prev => ({ ...prev, syair: false }));
    }
  };

  const handleGenerateImage = async () => {
    setLoading(prev => ({ ...prev, image: true }));
    setError(null);
    try {
      const rawImageUrl = await generatePredictionImage(formData);
      const finalImageUrl = await overlayLogo(rawImageUrl, formData);
      
      if (result) {
        setResult((prev: any) => ({ ...prev, imageUrl: finalImageUrl }));
      } else {
        setResult({ ...formData, imageUrl: finalImageUrl });
      }
    } catch (error: any) {
      console.error("Image generation failed:", error);
      if (error.message === "QUOTA_EXHAUSTED") {
        setError("Quota generation gambar habis. Silakan gunakan API Key Anda sendiri untuk melanjutkan.");
      } else {
        setError("Gagal menghasilkan gambar. Silakan coba lagi.");
      }
    } finally {
      setLoading(prev => ({ ...prev, image: false }));
    }
  };

  const handleDownload = () => {
    if (!result?.imageUrl) return;
    const link = document.createElement("a");
    link.href = result.imageUrl;
    link.download = `prediction-${formData.pasaran}-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* API Key Selection Banner */}
      {hasApiKey === false && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-mystic-gold/10 border border-mystic-gold/30 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-mystic-gold/20 rounded-full">
              <Star className="w-5 h-5 text-mystic-gold" />
            </div>
            <div>
              <p className="text-sm font-bold text-mystic-gold">Gunakan API Key Pribadi</p>
              <p className="text-xs text-slate-400">Untuk menghindari batasan quota dan mendapatkan hasil terbaik.</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSelectKey}
            className="border-mystic-gold/50 text-mystic-gold hover:bg-mystic-gold/20"
          >
            Pilih API Key
          </Button>
        </motion.div>
      )}

      {error && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-full">
              <Sparkles className="w-5 h-5 text-red-400" />
            </div>
            <p className="text-sm text-red-200">{error}</p>
          </div>
          {error.includes("Quota") && (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleSelectKey}
              className="bg-red-600 hover:bg-red-700"
            >
              Gunakan API Key Saya
            </Button>
          )}
        </motion.div>
      )}

      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12 flex flex-col items-center"
      >
        <img 
          src="https://ligabandot.com/resources/images/logo.png" 
          alt="Logo" 
          className="h-16 mb-6 drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]"
          referrerPolicy="no-referrer"
        />
        <h1 className="text-5xl md:text-6xl font-display font-bold gold-gradient mb-4 tracking-tight text-glow">
          Mystic Oracle
        </h1>
        <p className="text-slate-400 font-serif italic text-lg">
          "Menyingkap Tabir Takdir Melalui Syair dan Cahaya"
        </p>
      </motion.header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Section */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-5 space-y-6"
        >
          <Card className="glass border-mystic-gold/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-mystic-gold">
                <ScrollText className="w-5 h-5" />
                Data Prediksi
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRandomize}
                disabled={loading.randomizing}
                className="border-mystic-gold/30 text-mystic-gold hover:bg-mystic-gold/10"
              >
                {loading.randomizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Dices className="w-4 h-4 mr-1" />}
                Acak Semua
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data Prediksi</Label>
                  <Input 
                    placeholder="Contoh: JP Paus" 
                    value={formData.dataPrediksi}
                    onChange={(e) => handleInputChange("dataPrediksi", e.target.value)}
                    className="bg-white/5 border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Pasaran</Label>
                  <Select 
                    value={formData.pasaran}
                    onValueChange={(v) => handleInputChange("pasaran", v)}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PASARAN_OPTIONS.map(opt => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>BBFS</Label>
                  <Input 
                    placeholder="1234567" 
                    value={formData.bbfs}
                    onChange={(e) => handleInputChange("bbfs", e.target.value)}
                    className="bg-white/5 border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Angka Main</Label>
                  <Input 
                    placeholder="1234" 
                    value={formData.angkaMain}
                    onChange={(e) => handleInputChange("angkaMain", e.target.value)}
                    className="bg-white/5 border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label>4D</Label>
                  <Input 
                    placeholder="1234" 
                    value={formData.angka4d}
                    onChange={(e) => handleInputChange("angka4d", e.target.value)}
                    className="bg-white/5 border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Angka Shio</Label>
                  <Input 
                    placeholder="12" 
                    value={formData.angkaShio}
                    onChange={(e) => handleInputChange("angkaShio", e.target.value)}
                    className="bg-white/5 border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Shio</Label>
                  <Select 
                    value={formData.shio}
                    onValueChange={(v) => handleInputChange("shio", v)}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SHIO_OPTIONS.map(opt => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Syair / Pantun</Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleRegenerateSyair}
                    disabled={loading.syair}
                    className="text-mystic-gold hover:text-mystic-gold hover:bg-mystic-gold/10"
                  >
                    {loading.syair ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-1" />}
                    Regenerate
                  </Button>
                </div>
                <Textarea 
                  placeholder="Biarkan kosong untuk generate otomatis..." 
                  value={formData.syair}
                  onChange={(e) => handleInputChange("syair", e.target.value)}
                  className="bg-white/5 border-white/10 min-h-[80px] font-serif italic"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Visual Style</Label>
                  <Select 
                    value={formData.visualStyle}
                    onValueChange={(v) => handleInputChange("visualStyle", v)}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VISUAL_STYLE_OPTIONS.map(opt => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Character</Label>
                  <Select 
                    value={formData.character}
                    onValueChange={(v) => handleInputChange("character", v)}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CHARACTER_OPTIONS.map(opt => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Oracle Numbers (Shio {formData.shio})</Label>
                <div className="grid grid-cols-5 gap-2">
                  {formData.oracles.map((val, i) => (
                    <Input 
                      key={i}
                      placeholder={`#${i+1}`}
                      value={val}
                      onChange={(e) => handleOracleChange(i, e.target.value)}
                      className="bg-white/5 border-white/10 text-center px-1"
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Background</Label>
                <Select 
                  value={formData.background}
                  onValueChange={(v) => handleInputChange("background", v)}
                >
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BACKGROUND_OPTIONS.map(opt => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 space-y-3">
                <Button 
                  className="w-full bg-mystic-gold hover:bg-mystic-gold/80 text-mystic-purple font-bold h-12 text-lg shadow-lg shadow-mystic-gold/20"
                  onClick={handleGenerateAll}
                  disabled={loading.all}
                >
                  {loading.all ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Sparkles className="w-5 h-5 mr-2" />}
                  Generate Prediction
                </Button>
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    className="border-mystic-gold/30 text-mystic-gold hover:bg-mystic-gold/10"
                    onClick={handleGenerateImage}
                    disabled={loading.image}
                  >
                    {loading.image ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ImageIcon className="w-4 h-4 mr-2" />}
                    Gen Image
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-mystic-gold/30 text-mystic-gold hover:bg-mystic-gold/10"
                    onClick={handleDownload}
                    disabled={!result?.imageUrl}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Output Section */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-7"
        >
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="h-full"
              >
                <Card className="glass-gold border-mystic-gold/30 overflow-hidden h-full flex flex-col">
                  <div className="flex flex-col h-full">
                    {/* Image Column - Wide Format */}
                    <div 
                      className="relative w-full aspect-[1200/480] bg-black/20 cursor-zoom-in group/img"
                      onClick={() => setIsPreviewOpen(true)}
                    >
                      {loading.image || loading.all ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-10">
                          <Loader2 className="w-12 h-12 animate-spin text-mystic-gold mb-4" />
                          <p className="text-mystic-gold font-serif italic animate-pulse">Menenun Cahaya Ramalan...</p>
                        </div>
                      ) : null}
                      <img 
                        src={result.imageUrl} 
                        alt="Prediction Visual" 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-[1.02]"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover/img:opacity-100">
                        <div className="bg-mystic-gold/20 backdrop-blur-md p-3 rounded-full border border-mystic-gold/40">
                          <Sparkles className="w-6 h-6 text-mystic-gold" />
                        </div>
                      </div>
                      <div className="absolute top-6 right-6">
                        <Badge className="bg-mystic-gold text-mystic-purple border-none font-bold px-4 py-1 text-lg shadow-lg">
                          {result.pasaran}
                        </Badge>
                      </div>
                    </div>

                    {/* Details Column */}
                    <div className="p-6 md:p-8 flex flex-col justify-between space-y-8 flex-grow">
                      <div className="space-y-8">
                        {/* Numbers Grid - Reordered and Restyled */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-mystic-gold/50 to-mystic-purple/50 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative flex items-center justify-between p-4 bg-black/40 backdrop-blur-md rounded-xl border border-mystic-gold/20">
                              <div className="space-y-1">
                                <p className="text-[10px] uppercase tracking-[0.2em] text-mystic-gold/60 font-bold">Angka BBFS</p>
                                <p className="text-2xl font-bold text-white tracking-widest drop-shadow-sm">{result.bbfs || "-"}</p>
                              </div>
                              <div className="w-10 h-10 rounded-full bg-mystic-gold/10 flex items-center justify-center border border-mystic-gold/20">
                                <Star className="w-5 h-5 text-mystic-gold" />
                              </div>
                            </div>
                          </div>

                          <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-mystic-gold/50 to-mystic-purple/50 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative flex items-center justify-between p-4 bg-black/40 backdrop-blur-md rounded-xl border border-mystic-gold/20">
                              <div className="space-y-1">
                                <p className="text-[10px] uppercase tracking-[0.2em] text-mystic-gold/60 font-bold">Angka 4D</p>
                                <p className="text-2xl font-bold text-white tracking-widest drop-shadow-sm">{result.angka4d || "-"}</p>
                              </div>
                              <div className="w-10 h-10 rounded-full bg-mystic-gold/10 flex items-center justify-center border border-mystic-gold/20">
                                <Sparkles className="w-5 h-5 text-mystic-gold" />
                              </div>
                            </div>
                          </div>

                          <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-mystic-gold/50 to-mystic-purple/50 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative flex items-center justify-between p-4 bg-black/40 backdrop-blur-md rounded-xl border border-mystic-gold/20">
                              <div className="space-y-1">
                                <p className="text-[10px] uppercase tracking-[0.2em] text-mystic-gold/60 font-bold">Angka MAIN</p>
                                <p className="text-2xl font-bold text-white tracking-widest drop-shadow-sm">{result.angkaMain || "-"}</p>
                              </div>
                              <div className="w-10 h-10 rounded-full bg-mystic-gold/10 flex items-center justify-center border border-mystic-gold/20">
                                <Dices className="w-5 h-5 text-mystic-gold" />
                              </div>
                            </div>
                          </div>

                          <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-mystic-gold/50 to-mystic-purple/50 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative flex items-center justify-between p-4 bg-black/40 backdrop-blur-md rounded-xl border border-mystic-gold/20">
                              <div className="space-y-1">
                                <p className="text-[10px] uppercase tracking-[0.2em] text-mystic-gold/60 font-bold">Angka SHIO</p>
                                <p className="text-2xl font-bold text-white tracking-widest drop-shadow-sm">{result.angkaShio || "-"}</p>
                              </div>
                              <div className="w-10 h-10 rounded-full bg-mystic-gold/10 flex items-center justify-center border border-mystic-gold/20">
                                <Badge className="bg-mystic-gold/20 text-mystic-gold border-none text-[10px]">{result.shio}</Badge>
                              </div>
                            </div>
                          </div>

                          <div className="relative group lg:col-span-2">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-mystic-gold/50 to-mystic-purple/50 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative flex items-center justify-between p-4 bg-black/40 backdrop-blur-md rounded-xl border border-mystic-gold/20">
                              <div className="space-y-1">
                                <p className="text-[10px] uppercase tracking-[0.2em] text-mystic-gold/60 font-bold">Nama SHIO</p>
                                <p className="text-2xl font-bold text-mystic-gold uppercase tracking-wider drop-shadow-sm">{result.shio || "-"}</p>
                              </div>
                              <div className="w-10 h-10 rounded-full bg-mystic-gold/10 flex items-center justify-center border border-mystic-gold/20">
                                <Moon className="w-5 h-5 text-mystic-gold" />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <Separator className="flex-1 bg-mystic-gold/20" />
                            <p className="text-xs uppercase tracking-[0.3em] text-mystic-gold/40 font-bold whitespace-nowrap">Syair Prediksi</p>
                            <Separator className="flex-1 bg-mystic-gold/20" />
                          </div>
                          <div className="relative p-8 bg-mystic-purple/30 backdrop-blur-sm rounded-2xl border border-mystic-gold/30 shadow-2xl overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-mystic-gold/50 to-transparent"></div>
                            <Star className="absolute top-3 left-3 w-4 h-4 text-mystic-gold/20" />
                            <Star className="absolute bottom-3 right-3 w-4 h-4 text-mystic-gold/20" />
                            <p className="text-xl md:text-2xl font-serif italic text-center text-mystic-cream leading-relaxed text-glow relative z-10">
                              "{result.syair}"
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4">
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 text-center mb-3">Oracle Numbers for {result.shio}</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {result.oracles.filter(Boolean).map((n: string, i: number) => (
                            <div key={i} className="w-9 h-9 rounded-full flex items-center justify-center border border-mystic-gold/30 bg-mystic-gold/10 text-mystic-gold font-bold text-xs">
                              {n}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex items-center justify-center"
              >
                <div className="text-center space-y-6 max-w-md p-8 glass rounded-3xl border-mystic-gold/10">
                  <div className="relative inline-block">
                    <div className="absolute inset-0 blur-2xl bg-mystic-gold/20 rounded-full" />
                    <Dices className="w-24 h-24 text-mystic-gold relative" />
                  </div>
                  <h2 className="text-3xl font-display font-bold text-white">Siap Mengetahui Takdir?</h2>
                  <p className="text-slate-400 font-serif italic">
                    Gunakan tombol "Acak Semua" untuk mendapatkan angka keberuntungan instan atau isi data secara manual.
                  </p>
                  <div className="flex justify-center gap-2">
                    <Star className="w-4 h-4 text-mystic-gold animate-pulse" />
                    <Star className="w-4 h-4 text-mystic-gold animate-pulse delay-75" />
                    <Star className="w-4 h-4 text-mystic-gold animate-pulse delay-150" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <footer className="mt-16 text-center text-slate-500 text-sm font-serif">
        <p>© 2026 Mystic Oracle AI. All predictions are for entertainment purposes only.</p>
      </footer>

      {/* Fullscreen Preview Modal */}
      <AnimatePresence>
        {isPreviewOpen && result?.imageUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 md:p-8"
            onClick={() => setIsPreviewOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-7xl w-full aspect-[1200/480] shadow-2xl shadow-mystic-gold/20"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={result.imageUrl} 
                alt="Fullscreen Prediction" 
                className="w-full h-full object-contain rounded-lg"
                referrerPolicy="no-referrer"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute -top-12 right-0 text-white hover:bg-white/10"
                onClick={() => setIsPreviewOpen(false)}
              >
                <RefreshCw className="w-6 h-6 rotate-45" />
              </Button>
              <div className="absolute -bottom-12 left-0 right-0 flex justify-center gap-4">
                <Button 
                  className="bg-mystic-gold text-mystic-purple font-bold"
                  onClick={handleDownload}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Gambar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
