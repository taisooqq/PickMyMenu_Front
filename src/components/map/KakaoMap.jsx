import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import axios from 'axios';

const KakaoMap = ({ places, center }) => {
    const mapRef = useRef(null);
    const [selectedPlaceUrl, setSelectedPlaceUrl] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [placeImages, setPlaceImages] = useState({});
    const [showList, setShowList] = useState(false);
    const location = useLocation();
    const { keyword, resultMenuId } = location.state || {};
    const navigate = useNavigate();
    const apiUrl = process.env.REACT_APP_API_URL;

    useEffect(() => {
        const script = document.createElement('script');
        script.async = true;
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_MAP_KEY}&autoload=false`;
        document.head.appendChild(script);

        script.onload = () => {
            window.kakao.maps.load(() => {
                const map = new window.kakao.maps.Map(mapRef.current, {
                    center: new window.kakao.maps.LatLng(center.latitude, center.longitude),
                    level: 3
                });

                new window.kakao.maps.Marker({
                    position: new window.kakao.maps.LatLng(center.latitude, center.longitude),
                    map: map,
                    image: new window.kakao.maps.MarkerImage(
                        "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
                        new window.kakao.maps.Size(30, 40)
                    ),
                });

                places.forEach(place => {
                    const position = new window.kakao.maps.LatLng(place.y, place.x);
                    const marker = new window.kakao.maps.Marker({
                        position: position,
                        map: map,
                        title: place.place_name,
                        clickable: true,
                    });

                    const content = `
                        <div style="
                            position: relative;
                            bottom: 35px;
                            left: -50%;
                            transform: translateX(-50%);
                            background: white;
                            border: 1px solid #ccc;
                            border-radius: 10px;
                            padding: 5px 10px;
                            box-shadow: 0px 2px 4px rgba(0,0,0,0.2);
                            font-size: 12px;
                            white-space: nowrap;
                            text-align: center;">
                            ${place.place_name}
                        </div>
                    `;

                    const customOverlay = new window.kakao.maps.CustomOverlay({
                        position,
                        content,
                        xAnchor: -0.5,
                        yAnchor: -1.3,
                        map: map
                    });

                    window.kakao.maps.event.addListener(marker, "click", () => {
                        if (place.place_url.startsWith("http://")) {
                            place.place_url = place.place_url.replace("http://", "https://");
                            place.place_url = place.place_url.replace(".com/", ".com/m/");
                        }
                        setSelectedPlaceUrl(place.place_url);
                        setIsModalOpen(true);
                        customOverlay.setMap(map);
                    });
                });
            });
        };
    }, [places, center]);

    const handleReselect = () => {
        navigate('/parent');
    };

    const handlePlaceClick = (place) => {
        if (place.place_url.startsWith("http://")) {
            place.place_url = place.place_url.replace("http://", "https://");
            place.place_url = place.place_url.replace(".com/", ".com/m/");
        }
        setSelectedPlaceUrl(place.place_url);
        setIsModalOpen(true);
    };

    const handleApiCall = (place, resultMenuId) => {
        const requestData = {
            ...place,
            resultMenuId: resultMenuId
        };

        axios.post(`${apiUrl}/restaurant/saveInfo`, requestData)
            .then((response) => {
                navigate('/restaurant');
            })
            .catch((error) => {
                console.error('POST 요청 중 오류 발생:', error);
            });
    };

    return (
        <div style={{display: "flex", width: "100%", height: "100vh", flexDirection: "column", overflow: "hidden"}}>
            {/* 지도 */}
            <div ref={mapRef} style={{
                flex: 1,
                width: '100%',
                height: 'calc(100vh - 72px - 60px)', // 헤더와 버튼을 제외한 영역
                position: 'relative',
                zIndex: 1,
                overflow: 'hidden',
            }}/>

            {/* '리스트 보기' 버튼 */}
            <button
                onClick={() => setShowList(prev => !prev)}
                style={{
                    position: 'absolute',
                    top: '80px',
                    left: '20px',
                    zIndex: 10,
                    padding: "10px 20px",
                    backgroundColor: "gray",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontSize: "16px",
                }}
            >
                {showList ? '=' : '='}
            </button>

            {/* 지도 아래 버튼 */}
            <div style={{
                position: "absolute",
                bottom: "20px",
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: "20px",
                zIndex: 20,
                justifyContent: "center",  // 가운데 정렬
                width: "100%",  // 부모 컨테이너 너비에 맞게 설정
                padding: "0 20px"  // 여백을 주어 화면 크기에 맞게 조정
            }}>
                <button
                    onClick={handleReselect}
                    style={{
                        width: "auto",  // 버튼의 길이를 내용에 맞게 조정
                        padding: "10px 20px",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                        fontSize: "16px",
                        whiteSpace: "nowrap",  // 텍스트가 한 줄로 유지되도록
                        flex: "1",  // 버튼이 일정한 비율로 늘어나도록
                    }}
                >
                    다시 선택하기
                </button>
                <button
                    //onClick={() => handleApiCall(places[0], resultMenuId)}
                    style={{
                        width: "auto",  // 버튼의 길이를 내용에 맞게 조정
                        padding: "10px 20px",
                        backgroundColor: "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                        fontSize: "16px",
                        whiteSpace: "nowrap",  // 텍스트가 한 줄로 유지되도록
                        flex: "1",  // 버튼이 일정한 비율로 늘어나도록
                    }}
                >
                    {keyword} 맛집 정보
                </button>
            </div>

            {/* 지도 왼쪽 상단에 장소 목록 */}
            {showList && (
                <div style={{
                    position: "absolute",
                    top: '80px',
                    left: '70px',
                    width: '300px',
                    height: 'calc(100vh - 72px - 80px)', // 헤더 및 버튼 제외
                    overflowY: 'auto',
                    backgroundColor: "white",
                    boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
                    zIndex: 15,
                    padding: "10px",
                    borderRadius: "10px",
                }}>
                    <h3 style={{textAlign: 'center', marginBottom: '15px', fontSize: '1.2em'}}>
                        '{keyword}' 검색 결과
                    </h3>
                    <ul style={{listStyle: 'none', padding: 0}}>
                        {places.map((place, index) => (
                            <li
                                key={index}
                                onClick={() => handlePlaceClick(place)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '15px',
                                    marginBottom: '12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    backgroundColor: '#f9f9f9',
                                    transition: '0.3s',
                                }}
                            >
                                <div style={{
                                    width: '50px',
                                    height: '50px',
                                    borderRadius: '50%',
                                    overflow: 'hidden',
                                    marginRight: '10px'
                                }}>
                                    {place.image_url ? (
                                        <img src={place.image_url} alt={place.place_name}
                                             style={{width: '100%', height: '100%', objectFit: 'cover'}}/>
                                    ) : (
                                        <div style={{
                                            width: '100%',
                                            height: '100%',
                                            backgroundColor: '#ddd',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            color: '#fff',
                                        }}>None</div>
                                    )}
                                </div>
                                <div>
                                    <div style={{fontWeight: 'bold', fontSize: '1em'}}>{place.place_name}</div>
                                    <div style={{fontSize: '0.9em', color: '#555'}}>{place.address_name}</div>
                                    <div style={{fontSize: '0.8em', color: '#888'}}>{place.phone}</div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* 모달 */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        transition={{ type: "spring", stiffness: 100 }}
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            backgroundColor: "rgba(0, 0, 0, 0.8)",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            zIndex: 1000,
                        }}
                    >
                        <div
                            style={{
                                width: "90%",
                                maxWidth: "800px",
                                height: "80%",
                                backgroundColor: "white",
                                borderRadius: "15px",
                                overflow: "hidden",
                                position: "relative",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",  // 위와 아래 공간 확보
                            }}
                        >
                            {/* Iframe or Placeholder */}
                            <div style={{ flex: 1, overflow: "hidden" }}>
                                {selectedPlaceUrl ? (
                                    <iframe
                                        src={selectedPlaceUrl}
                                        style={{ width: "100%", height: "100%", border: "none" }}
                                        title="Place Info"
                                        frameBorder="0"
                                    />
                                ) : (
                                    <p style={{ textAlign: "center", margin: "20px" }}>
                                        장소 정보가 없습니다.
                                    </p>
                                )}
                            </div>

                            {/* 하단 버튼 영역 */}
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-around",
                                    padding: "10px 20px",
                                    borderTop: "1px solid #ccc",
                                    backgroundColor: "#f1f1f1",
                                }}
                            >
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    style={{
                                        padding: "10px 20px",
                                        backgroundColor: "red",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "5px",
                                        cursor: "pointer",
                                        fontSize: "16px",
                                    }}
                                >
                                    닫기
                                </button>

                                {/* "식당 이용하기" 버튼은 선택된 장소에 대해서만 보여지도록 수정 */}
                                {selectedPlaceUrl && (
                                    <button
                                        onClick={() => handleApiCall(places.find(place => place.place_url === selectedPlaceUrl))}
                                        style={{
                                            padding: "10px 20px",
                                            backgroundColor: "#28a745",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "5px",
                                            cursor: "pointer",
                                            fontSize: "16px",
                                        }}
                                    >
                                        식당 이용하기
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default KakaoMap;
