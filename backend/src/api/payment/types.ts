export interface IPayments extends Document {
    paymentID: string;
    projectID: string;
    freelancerName: string;
    freelancerEmail: string;
    price: string;
    ownerID: string;
    paymentStatus: string;
    date: Date;
    notes: string;
    isFreelencerAccept: string;
}
