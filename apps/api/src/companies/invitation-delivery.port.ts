export const INVITATION_DELIVERY = Symbol('INVITATION_DELIVERY');

export interface InvitationDeliveryMessage {
  companyName: string;
  email: string;
  token: string;
  expiresAt: Date;
}

export interface InvitationDeliveryPort {
  sendInvitation(message: InvitationDeliveryMessage): Promise<void>;
}
