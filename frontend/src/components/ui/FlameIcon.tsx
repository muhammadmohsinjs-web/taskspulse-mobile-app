import React from "react";
import Svg, { Path, Ellipse, Defs, LinearGradient, Stop, G, FeGaussianBlur, FeMerge, FeMergeNode, Filter, Circle } from "react-native-svg";

interface FlameIconProps {
  size?: number;
}

export const FlameIcon: React.FC<FlameIconProps> = ({ size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
    <Defs>
      <LinearGradient id="outerFlame" x1="256" y1="56" x2="256" y2="450" gradientUnits="userSpaceOnUse">
        <Stop offset="0" stopColor="#FF1F1F" />
        <Stop offset="0.45" stopColor="#FF5A12" />
        <Stop offset="1" stopColor="#FFB000" />
      </LinearGradient>
      <LinearGradient id="middleFlame" x1="250" y1="135" x2="250" y2="440" gradientUnits="userSpaceOnUse">
        <Stop offset="0" stopColor="#FF8A18" />
        <Stop offset="0.45" stopColor="#FFB21A" />
        <Stop offset="1" stopColor="#FFE04A" />
      </LinearGradient>
      <LinearGradient id="innerFlame" x1="256" y1="245" x2="256" y2="450" gradientUnits="userSpaceOnUse">
        <Stop offset="0" stopColor="#FFF59A" />
        <Stop offset="0.55" stopColor="#FFF7C7" />
        <Stop offset="1" stopColor="#FFFFFF" />
      </LinearGradient>
      <LinearGradient id="sideGlow" x1="130" y1="220" x2="260" y2="430" gradientUnits="userSpaceOnUse">
        <Stop offset="0" stopColor="#FF7A00" stopOpacity="0.9" />
        <Stop offset="1" stopColor="#FFB000" stopOpacity="0.1" />
      </LinearGradient>
      <Filter id="softShadow" x="120" y="410" width="270" height="70" filterUnits="userSpaceOnUse">
        <FeGaussianBlur stdDeviation="12" />
      </Filter>
      <Filter id="sparkGlow" x="-20" y="-20" width="80" height="80" filterUnits="userSpaceOnUse">
        <FeGaussianBlur stdDeviation="2.5" result="blur" />
        <FeMerge>
          <FeMergeNode in="blur" />
          <FeMergeNode in="SourceGraphic" />
        </FeMerge>
      </Filter>
    </Defs>
    <Ellipse cx="256" cy="440" rx="102" ry="18" fill="#FFB000" opacity="0.35" />
    <Path
      d="M146 398C104 356 98 290 124 238C139 208 165 187 183 171C170 204 177 231 199 247C197 210 216 178 246 144C286 99 291 66 268 35C341 62 382 123 383 191C384 235 367 261 353 272C379 272 393 248 394 222C424 255 425 299 408 333C435 368 419 425 373 448C329 470 201 452 146 398Z"
      fill="url(#outerFlame)"
    />
    <Path
      d="M254 454C183 454 124 400 119 324C115 263 149 216 188 179C232 137 267 101 250 49C330 76 369 135 372 191C374 229 362 259 348 274C372 281 397 255 393 220C432 258 430 310 408 342C438 390 405 454 326 465C303 468 278 454 254 454Z"
      fill="url(#outerFlame)"
    />
    <Path
      d="M330 446C386 421 404 364 374 322C348 286 322 264 323 216C324 185 317 159 300 135C305 187 271 212 237 238C200 267 178 302 182 354C186 416 241 460 330 446Z"
      fill="#FF7614"
      opacity="0.72"
    />
    <Path
      d="M256 443C205 424 184 381 191 335C198 287 231 253 267 228C305 201 328 174 322 130C362 180 347 230 363 267C373 291 397 308 399 345C401 394 360 436 301 448C286 451 270 448 256 443Z"
      fill="url(#middleFlame)"
    />
    <Path
      d="M259 443C217 420 208 381 226 348C237 328 252 315 255 294C270 333 306 324 309 283C348 322 360 360 341 394C329 415 305 435 259 443Z"
      fill="#FFE96A"
      opacity="0.95"
    />
    <Path
      d="M256 444C225 424 224 394 241 371C253 355 274 343 266 313C300 337 327 365 315 401C306 428 282 442 256 444Z"
      fill="url(#innerFlame)"
    />
    <Path
      d="M145 350C129 305 137 254 180 207C160 257 177 312 220 344C193 348 164 350 145 350Z"
      fill="url(#sideGlow)"
      opacity="0.55"
    />
    <G>
      <Path d="M141 125L147 140L162 146L147 152L141 167L135 152L120 146L135 140L141 125Z" fill="#FFA000" />
      <Circle cx="158" cy="181" r="8" fill="#FF5A12" />
      <Path d="M107 360L112 373L125 378L112 383L107 396L102 383L89 378L102 373L107 360Z" fill="#FFB000" />
      <Circle cx="398" cy="270" r="8" fill="#FF650F" />
      <Path d="M410 304L416 319L431 325L416 331L410 346L404 331L389 325L404 319L410 304Z" fill="#FF8A00" />
    </G>
  </Svg>
);
