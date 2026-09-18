export type ServiceType =
  | "에어컨청소"
  | "보일러설치"
  | "커튼블라인드"
  | "시스템행거"
  | "기타";

export const SERVICE_TYPES: ServiceType[] = [
  "에어컨청소",
  "보일러설치",
  "커튼블라인드",
  "시스템행거",
  "기타",
];

export type ScheduleStatus = "예정" | "완료" | "취소";

export type CustomerStatus = "가완" | "가망" | "재연락" | "부재중" | "거절";

export const CUSTOMER_STATUSES: CustomerStatus[] = [
  "가망",
  "가완",
  "재연락",
  "부재중",
  "거절",
];

// 계약서·도면 같은 파일이 필요한 업종 (구글 드라이브 링크로 관리)
export const CONTRACT_SERVICE_TYPES: ServiceType[] = ["커튼블라인드", "시스템행거"];

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  serviceType: ServiceType | string;
  memo: string;
  createdAt: string;
  status: CustomerStatus | string;
  lastServiceDate: string; // YYYY-MM-DD, 에어컨청소 재방문 기준일
  reminderIntervalYears: string; // "2"(기본) 또는 "1"
}

export interface Schedule {
  id: string;
  customerId: string;
  datetime: string; // ISO 8601
  serviceType: ServiceType | string;
  address: string;
  status: ScheduleStatus;
  memo: string;
  createdAt: string;
  googleEventId: string;
  photoUrls: string; // 시공 전·후 사진(구글 드라이브 등) 링크, 쉼표로 여러 개 가능
  estimateAmount: string; // 견적금액(원)
  warrantyUntil: string; // YYYY-MM-DD, A/S·하자보증 만료일
  contractFileUrl: string; // 계약서·도면 링크(구글 드라이브)
}

export interface ScheduleWithCustomer extends Schedule {
  customerName: string;
  customerPhone: string;
}
