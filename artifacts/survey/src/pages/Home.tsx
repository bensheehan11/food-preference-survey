import { Link } from "wouter";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full text-center">
          <h1 className="text-3xl font-bold text-neutral-900 mb-3">
            Undergraduate Business Student Food Preferences Survey
          </h1>
          <p className="text-neutral-600 mb-8 leading-relaxed">
            This short survey collects information about your food preferences
            and eating habits. It takes less than 2 minutes to complete.
            Your responses are anonymous and will only be shown as aggregated
            results.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/survey"
              className="inline-block px-6 py-3 rounded-lg font-semibold text-white bg-[#8A3BDB] hover:bg-[#7a2fcb] focus:outline-none focus:ring-2 focus:ring-[#8A3BDB] focus:ring-offset-2 transition-colors"
            >
              Take the Survey
            </Link>
            <Link
              href="/results"
              className="inline-block px-6 py-3 rounded-lg font-semibold text-[#8A3BDB] border border-[#8A3BDB] hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-[#8A3BDB] focus:ring-offset-2 transition-colors"
            >
              View Results
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
