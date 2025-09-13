import MedicalCard from "@/components/MedicalCard";

export default function Home() {
  const sharedImage = "/images/pic.jpeg"; // same image for all workers

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Pending */}
      <MedicalCard
        worker={{
          name: "Ahmed Nasr Mohammed",
          role: "Driver",
          photo: sharedImage,
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

      {/* Pending */}
      <MedicalCard
        worker={{
          name: "john smith",
          role: "Lawyer",
          photo: sharedImage,
          location: "Philippines",
          jobOffer: "1200",
          age: "25 years",
        }}
        status="pending"
        requirements={{
          title: "KSA Medical Requirements For Drivers",
          downloadUrl: "/docs/medical-requirements.pdf",
        }}
      />

      {/* Accepted */}
      <MedicalCard
        worker={{
          name: "Fatima Ali Hassan",
          role: "Nurse",
          photo: sharedImage,
          location: "India",
          jobOffer: "1500",
          age: "28 years",
        }}
        status="accepted"
        requirements={{
          title: "KSA Medical Requirements For Nurses",
          downloadUrl: "/docs/medical-requirements.pdf",
        }}
      />

      {/* Replace */}
      <MedicalCard
        worker={{
          name: "John Doe",
          role: "Technician",
          photo: sharedImage,
          location: "Egypt",
          jobOffer: "1100",
          age: "30 years",
        }}
        status="replace"
        requirements={{
          title: "KSA Medical Requirements For Technicians",
          downloadUrl: "/docs/medical-requirements.pdf",
        }}
      />
    </div>
  );
}
