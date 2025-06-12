import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Users, FileText, Calendar, ClipboardList } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Dental Tourism Georgia
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Premium dental care in beautiful Georgia. Discover world-class treatments 
            at affordable prices with our comprehensive dental tourism platform.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Public Site Card */}
          <Card className="hover:shadow-lg transition-shadow card-interactive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6 text-blue-600" />
                Patient Portal
              </CardTitle>
              <CardDescription>
                Book appointments, browse treatments, and plan your dental journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  • Browse dental treatments and packages
                  • View clinic locations and facilities
                  • Book consultations and appointments
                  • Access patient resources and guides
                </div>
                <Button className="w-full" disabled>
                  <Calendar className="mr-2 h-4 w-4" />
                  Coming Soon - Patient Portal
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Questionnaire Card */}
          <Card className="hover:shadow-lg transition-shadow border-green-200 card-interactive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-6 w-6 text-green-600" />
                Questionnaire
              </CardTitle>
              <CardDescription>
                Complete your dental assessment and personalized questionnaires
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  • Fill out personalized questionnaires
                  • Upload photos and medical information
                  • Help us understand your dental needs
                  • Complete assessment at your own pace
                </div>
                <Link href="/questionnaire">
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    <ClipboardList className="mr-2 h-4 w-4" />
                    Start Questionnaire
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Admin Interface Card */}
          <Card className="hover:shadow-lg transition-shadow border-blue-200 card-interactive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-6 w-6 text-blue-600" />
                Admin Dashboard
              </CardTitle>
              <CardDescription>
                Manage clinics, questionnaires, and patient assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  • Manage clinic information and services
                  • Create and customize questionnaire templates
                  • Assign questionnaires to patients
                  • Track patient responses and progress
                </div>
                <Link href="/admin">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <FileText className="mr-2 h-4 w-4" />
                    Access Admin Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">
            Why Choose Dental Tourism Georgia?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-xl">💰</span>
              </div>
              <h3 className="font-semibold mb-2">Affordable Prices</h3>
              <p className="text-sm text-gray-600">Save up to 70% on dental treatments compared to Western countries</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-xl">🏥</span>
              </div>
              <h3 className="font-semibold mb-2">Modern Facilities</h3>
              <p className="text-sm text-gray-600">State-of-the-art clinics with latest technology and equipment</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-xl">👨‍⚕️</span>
              </div>
              <h3 className="font-semibold mb-2">Expert Dentists</h3>
              <p className="text-sm text-gray-600">Highly qualified professionals with international certifications</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-200 text-center text-gray-600">
          <p>&copy; 2024 Dental Tourism Georgia. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
