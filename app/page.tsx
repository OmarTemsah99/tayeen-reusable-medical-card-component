import MedicalCard from "@/components/MedicalCard";

export default function Home() {
  return (
    <MedicalCard
      worker={{
        name: "Ahmed Nasr Mohammed",
        role: "Driver",
        photo: "/images/pic.jpeg",
        location: "Philippines",
        jobOffer: "1200",
        age: "32 years",
      }}
      status="pending"
      requirements={{
        title: "KSA Medical Requirements For Drivers",
        downloadUrl: "/docs/medical-requirements.pdf",
      }}
    />
  );
}
