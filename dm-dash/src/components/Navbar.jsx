import React, { useState } from "react";
import SearchDialog from "./SearchDialog";
import profileImg from "../assets/image.png";
export function Navbar({ selectedDistrict, onDistrictChange }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const notifications = [
    {
      id: 1,
      bdoName: "Rajesh Kumar",
      block: "Haldwani",
      message: "requested for fund release",
      type: "payment",
      icon: "payments",
      time: "2h ago",
      unread: true,
    },
    {
      id: 2,
      bdoName: "Sneha Kapur",
      block: "Bhimtal",
      message: "uploaded infrastructure update",
      type: "update",
      icon: "construction",
      time: "5h ago",
      unread: true,
    },
    {
      id: 3,
      bdoName: "Amit Singh",
      block: "Ramnagar",
      message: "submitted site inspection report",
      type: "report",
      icon: "visibility",
      time: "1d ago",
      unread: false,
    },
    {
      id: 4,
      bdoName: "Priya Devi",
      block: "Lalkuan",
      message: "reported emergency alert",
      type: "alert",
      icon: "warning",
      time: "2d ago",
      unread: false,
    },
    {
      id: 5,
      bdoName: "Vikram Negi",
      block: "Kaladhungi",
      message: "submitted monthly progress report",
      type: "report",
      icon: "analytics",
      time: "3d ago",
      unread: false,
    },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/10 px-8 py-3 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-white text-2xl">
              account_balance
            </span>
          </div>
          <div className="flex flex-col">
            <h1 className="font-headline font-black text-primary text-xl tracking-tight leading-none">
              PMDDKY
            </h1>
          </div>
        </div>

        {/* Center: Search Trigger */}
        <div className="flex-1 max-w-2xl px-12">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center gap-3 bg-surface-container-low border border-outline-variant/50 rounded-full px-5 py-2.5 group hover:border-primary transition-all shadow-sm hover:shadow-md cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl text-on-surface-variant group-hover:text-primary transition-colors">
              search
            </span>
            <span className="text-sm font-medium text-on-surface-variant/50 flex-1 text-left">
              Search districts...
            </span>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-on-surface-variant/40 bg-surface-container px-1.5 py-0.5 rounded border border-outline-variant/20 tracking-tighter uppercase">
                ⌘ K
              </span>
            </div>
          </button>
        </div>

        {/* Right: Actions & Profile */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`relative p-2.5 rounded-xl transition-all group ${
                  isNotificationsOpen
                    ? "bg-primary/10 text-primary shadow-inner"
                    : "hover:bg-surface-container-high text-on-surface-variant hover:text-primary"
                }`}
              >
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-error rounded-full border-2 border-surface animate-pulse"></span>
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-surface border border-outline-variant/30 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-outline-variant/20 bg-surface-container-low/50 flex items-center justify-between">
                    <h3 className="font-headline font-bold text-on-surface">
                      Notifications
                    </h3>
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {notifications.filter((n) => n.unread).length} New
                    </span>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-outline-variant/10 hover:bg-surface-container-high transition-colors cursor-pointer group/item ${
                          notification.unread ? "bg-primary/[0.02]" : ""
                        }`}
                      >
                        <div className="flex gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              notification.unread
                                ? "bg-primary/10 text-primary"
                                : "bg-surface-container text-on-surface-variant"
                            }`}
                          >
                            <span className="material-symbols-outlined text-lg">
                              {notification.icon}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-on-surface leading-snug">
                              <span className="font-bold">
                                {notification.bdoName}
                              </span>{" "}
                              from{" "}
                              <span className="font-bold text-primary">
                                {notification.block}
                              </span>{" "}
                              {notification.message}
                            </p>
                            <p className="text-[10px] text-on-surface-variant/60 mt-1 font-medium">
                              {notification.time}
                            </p>
                          </div>
                          {notification.unread && (
                            <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="w-full py-3 text-[11px] font-bold text-primary hover:bg-primary/5 transition-colors uppercase tracking-widest border-t border-outline-variant/10">
                    View All Notifications
                  </button>
                </div>
              )}
            </div>

            <button className="p-2.5 rounded-xl hover:bg-surface-container-high transition-all text-on-surface-variant hover:text-primary">
              <span className="material-symbols-outlined text-2xl leading-none">
                settings
              </span>
            </button>
          </div>

          <div className="h-8 w-[1px] bg-outline-variant/30"></div>

          <button className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-surface-container-high transition-all border border-transparent hover:border-outline-variant/30 group">
            <div className="flex flex-col items-end">
              <p className="text-xs font-bold text-on-surface leading-none">
                Veer Vikram Singh
              </p>
              <p className="text-[10px] text-on-surface-variant font-medium">
                State
              </p>
            </div>
            <div className="relative">
              <img
                src={profileImg}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover border-2 border-primary/10 group-hover:border-primary transition-all ring-4 ring-transparent group-hover:ring-primary/5"
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-surface rounded-full shadow-sm"></div>
            </div>
          </button>
        </div>
      </nav>

      <SearchDialog
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelect={onDistrictChange}
      />
    </>
  );
}
