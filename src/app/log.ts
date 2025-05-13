export interface Log {
    userId: string;
    userName: string;
    loginTime: Date;
    logoutTime: Date;
    actions: Array<{
        type: string;
        entity: string;
        entityId: string;
        details: string;
        timestamp: Date;
  }>;
}
