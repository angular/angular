// TODO: Add unit tests for this file.
import { Observable } from 'rxjs';
// #docregion

// 구독자가 구독을 실행하면 새로운 Observable 인스턴스를 생성하고
// 클라이언트의 접속 위치를 추적하기 시작합니다.
const locations = new Observable((observer) => {
  let watchId: number;


  // 접속 위치를 처리하는 API는 간단하게 사용해 봅니다.
  if ('geolocation' in navigator) {
    watchId = navigator.geolocation.watchPosition((position: Position) => {
      observer.next(position);
    }, (error: PositionError) => {
      observer.error(error);
    });
  } else {
    observer.error('Geolocation not available');
  }

  // 구독자가 구독을 해지하면 사용하던 데이터를 모두 지웁니다.
  return {
    unsubscribe() {
      navigator.geolocation.clearWatch(watchId);
    }
  };
});

// 옵저버블을 시작하려면 subscribe() 함수를 실행합니다.
const locationsSubscription = locations.subscribe({
  next(position) {
    console.log('Current Position: ', position);
  },
  error(msg) {
    console.log('Error Getting Location: ', msg);
  }
});

// 옵저버블은 10초 후에 구독을 해지합니다.
setTimeout(() => {
  locationsSubscription.unsubscribe();
}, 10000);
// #enddocregion
